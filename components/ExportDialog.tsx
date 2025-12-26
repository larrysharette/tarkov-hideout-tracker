"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { exportCurrentState } from "@/lib/utils/data-export";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [exportData, setExportData] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      const data = exportCurrentState();
      if (data) {
        setExportData(data);
      } else {
        setExportData("");
      }
      setCopied(false);
    }
  }, [open]);

  const handleCopy = async () => {
    if (!exportData) return;

    try {
      await navigator.clipboard.writeText(exportData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleDownload = () => {
    if (!exportData) return;

    const blob = new Blob([exportData], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tarkov-tracker-export-${
      new Date().toISOString().split("T")[0]
    }.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Copy or download your tracker data. This YAML format is compact,
            human-readable, and editable, making it easy to share or backup.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={exportData}
            readOnly
            className="font-mono text-xs min-h-[200px] max-h-[400px] overflow-y-auto"
            placeholder="No data to export"
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopy}
              disabled={!exportData}
              variant="outline"
              className="flex-1"
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!exportData}
              variant="outline"
              className="flex-1"
            >
              Download as .yaml
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
