import type { ReactNode } from 'react';

interface RowActionsProps {
  children: ReactNode;
}

export function RowActions({ children }: RowActionsProps) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}
