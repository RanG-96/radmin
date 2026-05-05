import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '../../lib/api/files';
import { getApiErrorMessage } from '../../lib/error';

interface FileUploadProps {
  onUpload?: (file: { id: string; original_name: string; url: string }) => void;
  accept?: string;
  allowedMimeTypes?: string[];
  maxSize?: number;
  helperText?: string;
  className?: string;
}

export function FileUpload({
  onUpload,
  accept,
  allowedMimeTypes,
  maxSize = 10 * 1024 * 1024,
  helperText,
  className = '',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => filesApi.upload(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-files'] });
      setFeedback({ type: 'success', message: `上传成功：${response.data.original_name}` });
      onUpload?.(response.data);
    },
    onError: (error) => {
      setFeedback({ type: 'error', message: getApiErrorMessage(error, '上传失败，请重试。') });
    },
  });

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const validationError = validateFile(file, allowedMimeTypes, maxSize);

      if (validationError) {
        setFeedback({ type: 'error', message: validationError });
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        return;
      }

      setFeedback(null);
      uploadMutation.mutate(file);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className={className}>
      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
          dragOver
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <svg className="mb-3 h-10 w-10 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
        <p className="mb-1 text-sm text-[var(--color-text)]">
          {uploadMutation.isPending ? '上传中...' : '点击或拖拽文件上传'}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {helperText || `支持常见图片、文档、音视频和压缩包，单文件不超过 ${formatSize(maxSize)}`}
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {feedback && (
        <p className={`mt-2 text-sm ${feedback.type === 'error' ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}

function validateFile(file: File, allowedMimeTypes: string[] | undefined, maxSize: number) {
  if (file.size > maxSize) {
    return `文件大小不能超过 ${formatSize(maxSize)}`;
  }

  if (allowedMimeTypes && allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.type)) {
    return `暂不支持该文件类型：${file.type || '未知类型'}`;
  }

  return null;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
