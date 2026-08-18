import { Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

type UploadFileButtonProps = {
  className?: string;
  disabled?: boolean;
  label?: string;
  onUploadFiles?: (files: File[]) => void;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost";
};

export function UploadFileButton({
  className,
  disabled = false,
  label = "Import File",
  onUploadFiles,
  size = "default",
  variant = "outline",
}: UploadFileButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDisabled = disabled || !onUploadFiles;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0 || !onUploadFiles) {
      return;
    }

    onUploadFiles(files);
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
        {label}
      </Button>
      <input
        accept="application/pdf,.pdf"
        className="hidden"
        multiple
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />
    </>
  );
}
