import type { ReactNode } from 'react';

interface StatusBadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'danger' | 'info' | 'warning' | 'accent';
}

const toneClasses: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700',
  accent: 'bg-purple-100 text-purple-700',
};

export function StatusBadge({ children, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
