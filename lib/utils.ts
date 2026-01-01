import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a string to snake_case
 * Example: "Customs" -> "customs", "Streets of Tarkov" -> "streets_of_tarkov"
 */
export function toSnakeCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Strips invalid properties from an object based on a Zod schema.
 * Instead of throwing errors, invalid properties are silently removed.
 *
 * @param schema - The Zod schema to validate against
 * @param values - The object to validate and clean
 * @returns A new object with only valid properties
 */
export function stripInvalidProperties<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  values: Record<string, unknown>
): Partial<z.infer<z.ZodObject<T>>> {
  const result: Record<string, unknown> = {};

  // Get all keys from the schema
  const schemaKeys = Object.keys(schema.shape);

  // Check each property individually
  schemaKeys.forEach((key) => {
    const value = values[key];

    // Skip undefined, null, and empty strings for string fields
    if (value === undefined || value === null) return;

    // For string fields, also skip empty strings
    const fieldSchema = schema.shape[key];
    if (fieldSchema && fieldSchema instanceof z.ZodString && value === "")
      return;

    try {
      // Validate the specific property against the schema
      if (fieldSchema) {
        // @ts-expect-error - zod parse is not typed
        fieldSchema.parse(value);
        result[key] = value;
      }
    } catch {
      // Property is invalid, skip it
    }
  });

  return result as Partial<z.infer<z.ZodObject<T>>>;
}

// Convert camelCase to Title Case
export function formatObjectiveType(type: string): string {
  return type
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
}
