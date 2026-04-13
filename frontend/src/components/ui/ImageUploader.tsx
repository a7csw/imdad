import { useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, X, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  className?: string;
}

export default function ImageUploader({
  value,
  onChange,
  maxImages = 10,
  className,
}: ImageUploaderProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remaining = maxImages - value.length;
      if (remaining <= 0) {
        setError(t('dashboard.max_images_reached', { max: maxImages }));
        return;
      }

      const toUpload = Array.from(files).slice(0, remaining);
      setError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        toUpload.forEach((file) => formData.append('images', file));

        const res = await api.post<{ urls: string[] }>('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        onChange([...value, ...res.data.urls]);
      } catch (err: any) {
        setError(err.response?.data?.message ?? t('common.try_again'));
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [value, onChange, maxImages, t]
  );

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const isFull = value.length >= maxImages;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload Zone */}
      {!isFull && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors',
            dragOver
              ? 'border-gold bg-gold/5'
              : 'border-dark-500 hover:border-gold/50 hover:bg-dark-700/50',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
              <p className="text-sm text-text-muted">{t('dashboard.uploading')}</p>
            </>
          ) : (
            <>
              <ImagePlus className="w-8 h-8 text-text-faint" />
              <p className="text-sm text-text-muted text-center">
                {t('dashboard.upload_images_hint')}
              </p>
              <p className="text-xs text-text-faint">
                {t('dashboard.upload_images_sub', { remaining: maxImages - value.length, max: maxImages })}
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-accent">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Thumbnails */}
      {value.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {value.map((url, i) => (
            <div key={url + i} className="relative group aspect-square rounded-lg overflow-hidden border border-dark-500 bg-dark-800">
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 end-1 w-5 h-5 rounded-full bg-dark-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
                aria-label={t('common.remove')}
              >
                <X className="w-3 h-3" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 start-1 text-[10px] bg-gold text-dark-900 px-1 rounded font-semibold leading-4">
                  {t('dashboard.cover')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Count indicator */}
      {value.length > 0 && (
        <p className="text-xs text-text-faint text-end">
          {value.length} / {maxImages}
        </p>
      )}
    </div>
  );
}
