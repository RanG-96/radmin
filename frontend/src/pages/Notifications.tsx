import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../lib/api/notifications';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import type { Notification } from '../lib/types/notification';

export function Notifications() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsApi.list({ page, per_page: 20 }).then((r) => r.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const typeIcon = (type: string) => {
    switch (type) {
      case 'system':
        return 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z';
      default:
        return 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0';
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">消息通知</h2>
        <Button variant="secondary" size="sm" onClick={() => markAllMutation.mutate()}>
          全部已读
        </Button>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]">
        {isLoading ? (
          <div className="py-12 text-center text-[var(--color-text-secondary)]">加载中...</div>
        ) : !data?.data.length ? (
          <div className="py-12 text-center text-[var(--color-text-secondary)]">暂无通知</div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {data.data.map((n: Notification) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 ${!n.is_read ? 'bg-[var(--color-primary)]/5' : ''}`}
              >
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={typeIcon(n.type)} />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-[var(--color-text)]">{n.title}</h4>
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{n.content}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {new Date(n.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
                {!n.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => markReadMutation.mutate(n.id)}>
                    已读
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

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
