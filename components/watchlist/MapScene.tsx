"use client";

import { Html, OrbitControls, useTexture } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { Canvas, useThree } from "@react-three/fiber";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { Pin } from "./useMapPins";

// Constants
const BASE_PLANE_HEIGHT = 10;
const ZOOM_FACTOR = 0.9;
const PIN_Z_OFFSET = 0.01;
const DEFAULT_CAMERA_FOV = 50;
const ZOOM_IN_MULTIPLIER = 0.1; // Allow zooming in to 10% of fitted size (10x zoom)
const FITTED_PADDING = 1.1; // 10% padding around the image when fitted

interface MapSceneProps {
  mapImageUrl: string;
  onMapClick?: (x: number, y: number, event: MouseEvent) => void;
  disablePan?: boolean;
  pins?: Pin[];
  renderPin?: (pin: Pin) => React.ReactNode;
  onZoomChange?: (isZoomed: boolean) => void;
  pinSize?: number; // Scale factor for pins (0.1 to 2.0)
  children?: React.ReactNode;
}

export interface MapSceneRef {
  resetCamera: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  isZoomed: () => boolean;
}

type PlaneSize = [width: number, height: number];

interface MapPlaneProps {
  mapImageUrl: string;
  onMapClick?: (x: number, y: number, event: MouseEvent) => void;
  onTextureLoaded?: (width: number, height: number) => void;
  onPlaneSizeChange?: (size: PlaneSize) => void;
}

function MapPlane({
  mapImageUrl,
  onMapClick,
  onTextureLoaded,
  onPlaneSizeChange,
}: MapPlaneProps) {
  const texture = useTexture(mapImageUrl);
  const meshRef = useRef<THREE.Mesh>(null);

  // Calculate plane size from texture aspect ratio
  const planeSize = useMemo<PlaneSize>(() => {
    if (!texture.image) return [BASE_PLANE_HEIGHT, BASE_PLANE_HEIGHT];

    const img = texture.image as HTMLImageElement;
    if (!img.width || !img.height)
      return [BASE_PLANE_HEIGHT, BASE_PLANE_HEIGHT];

    const aspect = img.width / img.height;
    return [BASE_PLANE_HEIGHT * aspect, BASE_PLANE_HEIGHT];
  }, [texture]);

  useEffect(() => {
    if (!texture.image) return;

    const img = texture.image as HTMLImageElement;
    if (!img.width || !img.height) return;

    onTextureLoaded?.(img.width, img.height);
    onPlaneSizeChange?.(planeSize);
  }, [texture, planeSize, onTextureLoaded, onPlaneSizeChange]);

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (!onMapClick || !meshRef.current) return;

      const intersection = event.intersections.find(
        (i) => i.object === meshRef.current
      );

      if (!intersection?.uv) return;

      const { uv } = intersection;

      // Convert UV coordinates (0-1) to percentage (0-100)
      // UV: x is left-to-right (0-1), y is bottom-to-top (0-1)
      // Our system: x is left-to-right (0-100), y is top-to-bottom (0-100)
      const x = Math.max(0, Math.min(100, uv.x * 100));
      const y = Math.max(0, Math.min(100, (1 - uv.y) * 100));

      const syntheticEvent = new MouseEvent("click", {
        clientX: event.clientX,
        clientY: event.clientY,
        bubbles: true,
        cancelable: true,
      });

      onMapClick(x, y, syntheticEvent);
    },
    [onMapClick]
  );

  const clickStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null
  );

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    clickStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now(),
    };
  }, []);

  const handlePointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!clickStartRef.current) return;

      const dx = Math.abs(event.clientX - clickStartRef.current.x);
      const dy = Math.abs(event.clientY - clickStartRef.current.y);
      const dt = Date.now() - clickStartRef.current.time;

      // Only trigger click if it was a quick tap (not a drag)
      // Threshold: less than 5px movement and less than 200ms
      if (dx < 5 && dy < 5 && dt < 200) {
        handleClick(event as unknown as ThreeEvent<MouseEvent>);
      }

      clickStartRef.current = null;
    },
    [handleClick]
  );

  return (
    <mesh
      ref={meshRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <planeGeometry args={planeSize} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

interface Pin3DProps {
  pin: Pin;
  planeSize: PlaneSize;
  renderPin?: (pin: Pin) => React.ReactNode;
  pinSize?: number;
}

function Pin3D({ pin, planeSize, renderPin, pinSize = 0.2 }: Pin3DProps) {
  // Convert percentage coordinates (0-100) to 3D world coordinates
  // pin.position: x is left-to-right (0-100), y is top-to-bottom (0-100)
  // 3D plane: centered at origin, extends from -width/2 to +width/2, -height/2 to +height/2
  const position = useMemo<[number, number, number]>(() => {
    const [width, height] = planeSize;
    const x = (pin.position.x / 100) * width - width / 2;
    const y = ((100 - pin.position.y) / 100) * height - height / 2;
    return [x, y, PIN_Z_OFFSET];
  }, [pin.position.x, pin.position.y, planeSize]);

  return (
    <group position={position} scale={pinSize}>
      <Html
        center
        style={{
          pointerEvents: "auto",
          userSelect: "none",
          height: "15px",
          width: "15px",
        }}
        transform
        occlude
      >
        {renderPin ? renderPin(pin) : <div>Pin {pin.id}</div>}
      </Html>
    </group>
  );
}

interface ControlsProps {
  disablePan?: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  minDistance: number;
  maxDistance: number;
  onZoomChange?: (isZoomed: boolean) => void;
  fittedDistance: number;
}

function Controls({
  disablePan = false,
  controlsRef,
  minDistance,
  maxDistance,
  onZoomChange,
  fittedDistance,
}: ControlsProps) {
  const { camera } = useThree();

  const handleChange = useCallback(() => {
    if (!onZoomChange) return;

    const currentDistance = camera.position.length();
    // Consider zoomed if distance is significantly different from fitted distance
    const tolerance = 0.01; // Small tolerance for floating point comparison
    const isZoomed = Math.abs(currentDistance - fittedDistance) > tolerance;
    onZoomChange(isZoomed);
  }, [camera, fittedDistance, onZoomChange]);

  // Configure mouse buttons explicitly for panning
  useEffect(() => {
    if (!controlsRef.current) return;

    // When rotation is disabled, use LEFT mouse for panning
    // RIGHT mouse for panning (alternative)
    // MIDDLE mouse for zoom
    controlsRef.current.mouseButtons = {
      LEFT: disablePan ? undefined : THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: disablePan ? undefined : THREE.MOUSE.PAN,
    };

    // Configure touch gestures
    controlsRef.current.touches = {
      ONE: disablePan ? undefined : THREE.TOUCH.PAN,
      TWO: THREE.TOUCH.DOLLY_ROTATE,
    };
  }, [controlsRef, disablePan]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={!disablePan}
      enableZoom={true}
      enableRotate={false}
      minDistance={minDistance}
      maxDistance={maxDistance}
      zoomSpeed={0.5}
      panSpeed={1.0}
      onChange={handleChange}
      makeDefault
    />
  );
}

const MapSceneInner = forwardRef<MapSceneRef, MapSceneProps>(
  (
    {
      mapImageUrl,
      onMapClick,
      disablePan,
      pins,
      renderPin,
      onZoomChange,
      pinSize = 0.2,
      children,
    },
    ref
  ) => {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const { camera, size } = useThree();
    const [planeSize, setPlaneSize] = useState<PlaneSize>([
      BASE_PLANE_HEIGHT,
      BASE_PLANE_HEIGHT,
    ]);
    const fittedDistanceRef = useRef<number>(10);

    // Calculate camera distance to fit plane to viewport
    const calculateFittedDistance = useCallback(
      (planeWidth: number, planeHeight: number): number => {
        // Check if camera is PerspectiveCamera
        if (camera.type !== "PerspectiveCamera") {
          return 10; // Fallback for non-perspective cameras
        }

        const perspectiveCamera = camera as THREE.PerspectiveCamera;
        const fov = perspectiveCamera.fov * (Math.PI / 180); // Convert to radians
        const aspect = size.width / size.height;

        // Calculate distance needed to fit the plane height
        const distanceForHeight =
          (planeHeight * FITTED_PADDING) / (2 * Math.tan(fov / 2));

        // Calculate distance needed to fit the plane width
        const distanceForWidth =
          (planeWidth * FITTED_PADDING) / (2 * Math.tan(fov / 2) * aspect);

        // Use the larger distance to ensure the entire plane fits
        return Math.max(distanceForHeight, distanceForWidth);
      },
      [camera, size.width, size.height]
    );

    // Calculate zoom limits based on plane size
    const zoomLimits = useMemo(() => {
      const [width, height] = planeSize;
      const fittedDistance = calculateFittedDistance(width, height);
      fittedDistanceRef.current = fittedDistance;
      const minDistance = fittedDistance * ZOOM_IN_MULTIPLIER; // Allow zooming in far
      const maxDistance = fittedDistance; // Max zoom out = fitted to window

      return { minDistance, maxDistance, fittedDistance };
    }, [planeSize, calculateFittedDistance]);

    // Initialize camera to fit the plane and adjust on resize
    useEffect(() => {
      if (
        planeSize[0] === BASE_PLANE_HEIGHT &&
        planeSize[1] === BASE_PLANE_HEIGHT
      ) {
        return; // Wait for actual plane size
      }

      const fittedDistance = calculateFittedDistance(
        planeSize[0],
        planeSize[1]
      );
      camera.position.set(0, 0, fittedDistance);
      camera.lookAt(0, 0, 0);

      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }

      // Notify initial fitted state
      onZoomChange?.(false);
    }, [
      planeSize,
      camera,
      size.width,
      size.height,
      calculateFittedDistance,
      onZoomChange,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        resetCamera: () => {
          const fittedDistance = fittedDistanceRef.current;
          // Reset camera position to fitted distance
          camera.position.set(0, 0, fittedDistance);
          camera.lookAt(0, 0, 0);

          // Reset controls target to origin and update
          if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
          }

          // Notify that we're back to fitted state
          onZoomChange?.(false);
        },
        zoomIn: () => {
          const currentDistance = camera.position.length();
          const newDistance = Math.max(
            zoomLimits.minDistance,
            currentDistance * ZOOM_FACTOR
          );
          camera.position.normalize().multiplyScalar(newDistance);
          controlsRef.current?.update();
        },
        zoomOut: () => {
          const currentDistance = camera.position.length();
          const newDistance = Math.min(
            zoomLimits.maxDistance,
            currentDistance / ZOOM_FACTOR
          );
          camera.position.normalize().multiplyScalar(newDistance);
          controlsRef.current?.update();
        },
        isZoomed: () => {
          const currentDistance = camera.position.length();
          const tolerance = 0.01;
          return (
            Math.abs(currentDistance - fittedDistanceRef.current) > tolerance
          );
        },
      }),
      [camera, zoomLimits, onZoomChange]
    );

    const handlePlaneSizeChange = useCallback((size: PlaneSize) => {
      setPlaneSize(size);
    }, []);

    const handleTextureLoaded = useCallback(() => {
      // Texture loaded callback for potential future use
    }, []);

    const visiblePins = useMemo(() => {
      return pins ?? [];
    }, [pins]);

    return (
      <>
        <ambientLight intensity={1} />
        <MapPlane
          mapImageUrl={mapImageUrl}
          onMapClick={onMapClick}
          onTextureLoaded={handleTextureLoaded}
          onPlaneSizeChange={handlePlaneSizeChange}
        />
        {visiblePins.map((pin) => (
          <Pin3D
            key={pin.id}
            pin={pin}
            planeSize={planeSize}
            renderPin={renderPin}
            pinSize={pinSize}
          />
        ))}
        <Controls
          disablePan={disablePan}
          controlsRef={controlsRef}
          minDistance={zoomLimits.minDistance}
          maxDistance={zoomLimits.maxDistance}
          fittedDistance={zoomLimits.fittedDistance}
          onZoomChange={onZoomChange}
        />
        {children}
      </>
    );
  }
);

MapSceneInner.displayName = "MapSceneInner";

export const MapScene = forwardRef<MapSceneRef, MapSceneProps>(
  (
    {
      mapImageUrl,
      onMapClick,
      disablePan,
      pins,
      renderPin,
      onZoomChange,
      pinSize,
      children,
    },
    ref
  ) => {
    return (
      <Canvas
        camera={{
          position: [0, 0, 10],
          fov: DEFAULT_CAMERA_FOV,
        }}
        gl={{ antialias: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <MapSceneInner
          ref={ref}
          mapImageUrl={mapImageUrl}
          onMapClick={onMapClick}
          disablePan={disablePan}
          pins={pins}
          renderPin={renderPin}
          onZoomChange={onZoomChange}
          pinSize={pinSize}
        >
          {children}
        </MapSceneInner>
      </Canvas>
    );
  }
);

MapScene.displayName = "MapScene";
