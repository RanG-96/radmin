import type { ReactNode } from 'react';

interface DataTableProps {
  filter?: ReactNode;
  children: ReactNode;
  pagination?: ReactNode;
}

export function DataTable({ filter, children, pagination }: DataTableProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]">
      {filter && <div className="border-b border-[var(--color-border)] p-4">{filter}</div>}
      {children}
      {pagination}
    </div>
  );
}
