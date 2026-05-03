import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../lib/api';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/DropdownMenu';
import { Separator } from './ui/Separator';

export function NotificationBell() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => notificationsApi.unreadCount().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: recentData } = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: () => notificationsApi.list({ page: 1, per_page: 5 }).then((r) => r.data),
    enabled: open,
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
    },
  });

  const count = unreadData?.count ?? 0;
  const notifications = recentData?.data ?? [];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors">
          <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-error)] text-[10px] font-medium text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-medium text-[var(--color-text)]">消息通知</span>
          {count > 0 && (
            <button
              className="text-xs text-[var(--color-primary)] hover:underline"
              onClick={() => markAllMutation.mutate()}
            >
              全部已读
            </button>
          )}
        </div>
        <Separator />
        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-[var(--color-text-secondary)]">
            暂无通知
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={`flex flex-col gap-1 px-3 py-2 ${!n.is_read ? 'bg-[var(--color-primary)]/5' : ''}`}
              onSelect={() => { if (!n.is_read) markReadMutation.mutate(n.id); }}
            >
              <span className="text-sm font-medium text-[var(--color-text)]">{n.title}</span>
              <span className="text-xs text-[var(--color-text-secondary)] line-clamp-2">{n.content}</span>
            </DropdownMenuItem>
          ))
        )}
        <Separator />
        <div className="px-3 py-2">
          <a href="/notifications" className="text-xs text-[var(--color-primary)] hover:underline">
            查看全部通知
          </a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
