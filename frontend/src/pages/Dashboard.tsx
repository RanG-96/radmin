import { useAuth } from '../hooks/useAuth';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-semibold text-[var(--color-text)]">
        Dashboard
      </h2>
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
        <h3 className="mb-2 text-lg font-medium text-[var(--color-text)]">Welcome, {user?.username}!</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          This is your admin dashboard. You're now signed in.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['Users', 'Settings', 'Analytics'].map((item) => (
          <div
            key={item}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 hover:shadow-sm transition-shadow cursor-pointer"
          >
            <h4 className="font-medium text-[var(--color-text)]">{item}</h4>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Manage your {item.toLowerCase()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
