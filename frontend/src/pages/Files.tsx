import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi, type FileRecord } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '../components/ui/AlertDialog';
import { FileUpload } from '../components/ui/FileUpload';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState, LoadingState } from '../components/ui/EmptyState';

export function Files() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<FileRecord | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-files', page],
    queryFn: () => filesApi.list({ page, per_page: 20 }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => filesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-files'] });
      setDeleteTarget(null);
    },
  });

  const handleDownload = async (file: FileRecord) => {
    const response = await filesApi.download(file.id);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = file.original_name;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">文件管理</h2>
      </div>

      <FileUpload
        onUpload={() => queryClient.invalidateQueries({ queryKey: ['admin-files'] })}
        className="max-w-lg"
      />

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>文件名</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>大小</TableHead>
              <TableHead>上传时间</TableHead>
              <TableHead className="min-w-[180px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingState colSpan={5} />
            ) : !data?.data.length ? (
              <EmptyState message="暂无上传文件" colSpan={5} />
            ) : (
              data.data.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.original_name}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{file.mime_type}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{formatSize(file.size)}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">
                    {new Date(file.created_at).toLocaleString('zh-CN')}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" className="shrink-0" onClick={() => handleDownload(file)}>下载</Button>
                      <Button variant="secondary" size="sm" className="shrink-0 text-[var(--color-error)] hover:text-[var(--color-error)]" onClick={() => setDeleteTarget(file)}>删除</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {data && (
          <Pagination
            page={page}
            total={data.total}
            perPage={data.per_page}
            onPageChange={setPage}
          />
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>删除文件</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除文件 <strong>{deleteTarget?.original_name}</strong> 吗？此操作不可撤销。
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              删除
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
