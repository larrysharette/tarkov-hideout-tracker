"use client";

import { useState, useRef } from "react";
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
import { importToLocalStorage, importData } from "@/lib/utils/data-export";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [importText, setImportText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportText(content.trim());
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setError("Please provide import data");
      return;
    }

    try {
      // Validate the data structure
      const imported = importData(importText.trim());
      
      // Import to localStorage
      importToLocalStorage(importText.trim());
      
      // Reload the page to apply the changes
      setSuccess(true);
      onOpenChange(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to import data. Please check the format."
      );
      setSuccess(false);
    }
  };

  const handleClear = () => {
    setImportText("");
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Import your tracker data from a file or paste the exported data. This
            will replace your current data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".yaml,.yml,.txt"
              onChange={handleFileSelect}
              className="hidden"
              id="file-import"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              Select .yaml or .txt File
            </Button>
          </div>
          <div className="relative">
            <Textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                setError(null);
                setSuccess(false);
              }}
              placeholder="Paste your exported data here..."
              className="font-mono text-xs min-h-[200px] max-h-[400px] overflow-y-auto"
            />
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-primary bg-primary/10 border border-primary/20 rounded-md p-2">
              Data imported successfully! Reloading...
            </div>
          )}
        </div>
        <DialogFooter className="flex gap-2">
          <Button onClick={handleClear} variant="outline">
            Clear
          </Button>
          <Button
            onClick={handleImport}
            disabled={!importText.trim() || success}
            variant="default"
          >
            Import Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

