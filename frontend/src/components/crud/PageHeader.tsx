import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="grid gap-1">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">{title}</h2>
        {description && (
          <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
