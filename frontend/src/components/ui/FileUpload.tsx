import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '../../lib/api';

interface FileUploadProps {
  onUpload?: (file: { id: string; original_name: string; url: string }) => void;
  accept?: string;
  className?: string;
}

export function FileUpload({ onUpload, accept, className = '' }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => filesApi.upload(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-files'] });
      onUpload?.(response.data);
    },
  });

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      uploadMutation.mutate(files[0]);
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
          {accept || '支持任意文件格式'}
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {uploadMutation.isError && (
        <p className="mt-2 text-sm text-[var(--color-error)]">
          上传失败，请重试。
        </p>
      )}
    </div>
  );
}
