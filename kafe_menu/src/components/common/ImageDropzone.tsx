import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageDropzoneProps {
  value?: File | null;
  initialPreviewUrl?: string | null;
  onChange: (file: File | null) => void;
  className?: string;
}

export function ImageDropzone({
  value,
  initialPreviewUrl,
  onChange,
  className,
}: ImageDropzoneProps) {
  const objectUrlRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(initialPreviewUrl ?? null);

  useEffect(() => {
    if (value instanceof File) {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(value);
      objectUrlRef.current = url;
      setPreview(url);
      return () => {
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
      };
    }

    if (value === null) {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
      setPreview(null);
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setPreview(initialPreviewUrl ?? null);
  }, [value, initialPreviewUrl]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (file) onChange(file);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    noClick: Boolean(preview),
    noKeyboard: Boolean(preview),
  });

  const handleClear = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative flex min-h-[180px] w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/40 transition-colors',
        isDragActive && 'border-primary bg-primary-50',
        className,
      )}
    >
      <input {...getInputProps()} />
      {preview ? (
        <>
          <img
            src={preview}
            alt="Ürün görseli"
            className="max-h-[260px] w-full object-contain"
          />
          <div className="absolute right-2 top-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              <Upload className="mr-1 h-3.5 w-3.5" /> Değiştir
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 p-6 text-center text-muted-foreground">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary">
            <ImagePlus className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Görseli sürükleyip bırak ya da tıkla
          </p>
          <p className="text-xs">PNG, JPG, WEBP · tek dosya</p>
        </div>
      )}
    </div>
  );
}
