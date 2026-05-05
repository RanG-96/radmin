import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '../lib/api/files';
import { getApiErrorMessage } from '../lib/error';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '../components/ui/AlertDialog';
import { FileUpload } from '../components/ui/FileUpload';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState, LoadingState } from '../components/ui/EmptyState';
import { DataTable } from '../components/crud/DataTable';
import { FilterBar } from '../components/crud/FilterBar';
import { PageHeader } from '../components/crud/PageHeader';
import { RowActions } from '../components/crud/RowActions';
import type { FileRecord } from '../lib/types/file';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/vnd.rar',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];
const FILE_TYPE_OPTIONS = [
  { value: 'all', label: '全部类型' },
  { value: 'image', label: '图片' },
  { value: 'document', label: '文档' },
  { value: 'media', label: '音视频' },
  { value: 'other', label: '其他' },
];

export function Files() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [mimeType, setMimeType] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-files', page, keyword, mimeType],
    queryFn: () =>
      filesApi
        .list({
          page,
          per_page: 20,
          keyword: keyword || undefined,
          mime_type: mimeType === 'all' ? undefined : mimeType,
        })
        .then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => filesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-files'] });
      setFeedback({ type: 'success', message: '文件已删除' });
      setDeleteTarget(null);
    },
    onError: (error) => {
      setFeedback({ type: 'error', message: getApiErrorMessage(error, '删除失败，请稍后重试') });
    },
  });

  const handleDownload = async (file: FileRecord) => {
    try {
      const response = await filesApi.download(file.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_name;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setFeedback({ type: 'error', message: getApiErrorMessage(error, '下载失败，请稍后重试') });
    }
  };

  const handlePreview = async (file: FileRecord) => {
    if (!canPreview(file.mime_type)) {
      setFeedback({ type: 'error', message: '当前文件类型暂不支持预览，请直接下载。' });
      return;
    }

    const previewWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!previewWindow) {
      setFeedback({ type: 'error', message: '浏览器拦截了预览窗口，请允许弹窗后重试。' });
      return;
    }

    try {
      const response = await filesApi.download(file.id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: file.mime_type }));
      previewWindow.location.href = url;
      setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      previewWindow.close();
      setFeedback({ type: 'error', message: getApiErrorMessage(error, '预览失败，请稍后重试') });
    }
  };

  const handleCopyLink = async (file: FileRecord) => {
    try {
      await navigator.clipboard.writeText(toAbsoluteFileUrl(file.url));
      setFeedback({ type: 'success', message: `已复制链接：${file.original_name}` });
    } catch {
      setFeedback({ type: 'error', message: '复制链接失败，请检查浏览器权限。' });
    }
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setKeyword(keywordInput.trim());
  };

  const handleReset = () => {
    setKeywordInput('');
    setKeyword('');
    setMimeType('all');
    setPage(1);
    setFeedback(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="grid gap-6">
      <PageHeader
        title="文件管理"
        description="轻量附件库，支持上传、搜索、预览、复制链接和删除。"
      />

      <FileUpload
        onUpload={(file) => {
          setFeedback({ type: 'success', message: `文件已上传：${file.original_name}` });
          queryClient.invalidateQueries({ queryKey: ['admin-files'] });
        }}
        accept={ALLOWED_FILE_TYPES.join(',')}
        allowedMimeTypes={ALLOWED_FILE_TYPES}
        maxSize={MAX_FILE_SIZE}
        className="max-w-lg"
        helperText="支持常见图片、文档、音视频和压缩包，单文件不超过 10MB"
      />

      {feedback && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.type === 'error'
              ? 'border-[var(--color-error)]/20 bg-[var(--color-error)]/5 text-[var(--color-error)]'
              : 'border-[var(--color-success)]/20 bg-[var(--color-success)]/5 text-[var(--color-success)]'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <DataTable
        filter={(
          <form className="flex flex-wrap items-center gap-3" onSubmit={handleSearch}>
            <FilterBar>
              <Input
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="按文件名搜索"
                className="w-64"
              />
              <Select
                value={mimeType}
                onValueChange={(value) => {
                  setMimeType(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-40">
                  {FILE_TYPE_OPTIONS.find((option) => option.value === mimeType)?.label ?? '全部类型'}
                </SelectTrigger>
                <SelectContent>
                  {FILE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" variant="primary" size="sm">
                搜索
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={handleReset}>
                重置
              </Button>
              {isFetching && !isLoading && (
                <span className="text-sm text-[var(--color-text-secondary)]">筛选中...</span>
              )}
            </FilterBar>
          </form>
        )}
        pagination={data ? (
          <Pagination
            page={page}
            total={data.total}
            perPage={data.per_page}
            onPageChange={setPage}
          />
        ) : undefined}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>文件名</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>大小</TableHead>
              <TableHead>上传人</TableHead>
              <TableHead>上传时间</TableHead>
              <TableHead>文件链接</TableHead>
              <TableHead className="min-w-[180px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingState colSpan={7} />
            ) : !data?.data.length ? (
              <EmptyState
                message={keyword || mimeType !== 'all' ? '没有匹配当前筛选条件的文件' : '暂无上传文件'}
                colSpan={7}
              />
            ) : (
              data.data.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.original_name}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{file.mime_type}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{formatSize(file.size)}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{file.uploader_name || '未知'}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">
                    {new Date(file.created_at).toLocaleString('zh-CN')}
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm text-[var(--color-text-secondary)]">
                        {file.url}
                      </span>
                      <Button variant="ghost" size="sm" type="button" onClick={() => handleCopyLink(file)}>
                        复制
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <RowActions>
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        className="shrink-0"
                        disabled={!canPreview(file.mime_type)}
                        onClick={() => handlePreview(file)}
                      >
                        预览
                      </Button>
                      <Button variant="secondary" size="sm" type="button" className="shrink-0" onClick={() => handleDownload(file)}>
                        下载
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        className="shrink-0 text-[var(--color-error)] hover:text-[var(--color-error)]"
                        onClick={() => setDeleteTarget(file)}
                      >
                        删除
                      </Button>
                    </RowActions>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DataTable>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>删除文件</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除文件 <strong>{deleteTarget?.original_name}</strong> 吗？此操作不可撤销。
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              删除
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function canPreview(mimeType: string) {
  return (
    mimeType.startsWith('image/') ||
    mimeType.startsWith('text/') ||
    mimeType === 'application/pdf' ||
    mimeType.startsWith('audio/') ||
    mimeType.startsWith('video/')
  );
}

function toAbsoluteFileUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${window.location.origin}${url}`;
}
