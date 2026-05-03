import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { useQuery } from '@tanstack/react-query';
import { adminApi, notificationsApi } from '../lib/api';
import { NavLink } from 'react-router-dom';

export function Dashboard() {
  const { user } = useAuth();
  const { getSetting } = useSettings();

  const { data: usersData } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: () => adminApi.listUsers({ page: 1, per_page: 1 }).then((r) => r.data.total),
    enabled: user?.role === 'admin',
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationsApi.unreadCount().then((r) => r.data.count),
  });

  const siteTitle = getSetting('site_title', 'Radmin');

  const cards = [
    { label: '用户管理', value: usersData ?? '-', desc: '注册用户总数', to: '/users', adminOnly: true },
    { label: '消息通知', value: unreadData ?? 0, desc: '未读消息数', to: '/notifications', adminOnly: false },
    { label: '系统设置', value: '', desc: '配置管理面板', to: '/settings', adminOnly: true },
    { label: '文件管理', value: '', desc: '管理上传的文件', to: '/files', adminOnly: true },
    { label: '选项配置', value: '', desc: '管理下拉选项、状态选项和枚举配置', to: '/dict-types', adminOnly: true },
    { label: '操作日志', value: '', desc: '查看操作记录', to: '/operation-logs', adminOnly: true },
  ];

  const filtered = cards.filter((c) => !c.adminOnly || user?.role === 'admin');

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-semibold text-[var(--color-text)]">
        仪表盘
      </h2>
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
        <h3 className="mb-2 text-lg font-medium text-[var(--color-text)]">
          欢迎使用 {siteTitle}，{user?.username}！
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          请使用侧边栏导航管理面板。
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((card) => (
          <NavLink
            key={card.label}
            to={card.to}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 hover:shadow-sm transition-shadow"
          >
            <h4 className="font-medium text-[var(--color-text)]">{card.label}</h4>
            {card.value !== '' && (
              <p className="mt-1 text-2xl font-semibold text-[var(--color-primary)]">{card.value}</p>
            )}
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{card.desc}</p>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
