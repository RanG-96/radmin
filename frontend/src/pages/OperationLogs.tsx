import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { operationLogsApi } from '../lib/api';
import { Input } from '../components/ui/Input';
import { FormSelect } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState, LoadingState } from '../components/ui/EmptyState';

const methodOptions = [
  { value: 'ALL', label: '全部方法' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
];

export function OperationLogs() {
  const [page, setPage] = useState(1);
  const [username, setUsername] = useState('');
  const [path, setPath] = useState('');
  const [method, setMethod] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-operation-logs', page, username, path, method],
    queryFn: () =>
      operationLogsApi
        .list({
          page,
          per_page: 20,
          username: username || undefined,
          path: path || undefined,
          method: method && method !== 'ALL' ? method : undefined,
        })
        .then((r) => r.data),
  });

  const methodBadge = (m: string) => {
    const colors: Record<string, string> = {
      POST: 'bg-blue-100 text-blue-700',
      PUT: 'bg-yellow-100 text-yellow-700',
      DELETE: 'bg-red-100 text-red-700',
      PATCH: 'bg-purple-100 text-purple-700',
    };
    return colors[m] ?? 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-semibold text-[var(--color-text)]">操作日志</h2>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="flex flex-wrap gap-3 border-b border-[var(--color-border)] p-3">
          <Input
            placeholder="用户名..."
            value={username}
            onChange={(e) => { setUsername(e.target.value); setPage(1); }}
            className="w-40"
          />
          <Input
            placeholder="路径..."
            value={path}
            onChange={(e) => { setPath(e.target.value); setPage(1); }}
            className="w-48"
          />
          <FormSelect
            options={methodOptions}
            value={method}
            onValueChange={(v) => { setMethod(v); setPage(1); }}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>方法</TableHead>
              <TableHead>路径</TableHead>
              <TableHead>用户</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>状态码</TableHead>
              <TableHead>耗时</TableHead>
              <TableHead>时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingState colSpan={7} />
            ) : !data?.data.length ? (
              <EmptyState message="暂无操作日志" colSpan={7} />
            ) : (
              data.data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${methodBadge(log.method)}`}>
                      {log.method}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm max-w-xs truncate">{log.path}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{log.username ?? '-'}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)] font-mono text-sm">{log.ip ?? '-'}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{log.status_code}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{log.duration_ms}ms</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)] text-sm">
                    {new Date(log.created_at).toLocaleString('zh-CN')}
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
    </div>
  );
}
