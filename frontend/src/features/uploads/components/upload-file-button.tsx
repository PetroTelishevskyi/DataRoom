import { Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type UploadFileButtonProps = {
  className?: string;
  disabled?: boolean;
  label?: string;
  onUploadFile?: (file: File) => Promise<void>;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost";
};

export function UploadFileButton({
  className,
  disabled = false,
  label = "Import File",
  onUploadFile,
  size = "default",
  variant = "outline",
}: UploadFileButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isDisabled = disabled || isUploading || !onUploadFile;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const [file] = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!file || !onUploadFile) {
      return;
    }

    setIsUploading(true);

    try {
      await onUploadFile(file);
    } catch {
      // Upload handlers show their own toast messages.
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <Button
        className={className}
        disabled={isDisabled}
        onClick={() => inputRef.current?.click()}
        size={size}
        type="button"
        variant={variant}
      >
        <Upload aria-hidden className="h-4 w-4" />
        {isUploading ? "Uploading..." : label}
      </Button>
      <input
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => {
          void handleFileChange(event);
        }}
        ref={inputRef}
        type="file"
      />
    </>
  );
}
