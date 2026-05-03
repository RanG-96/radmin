interface EmptyStateProps {
  message?: string;
  colSpan?: number;
}

export function EmptyState({ message = '暂无数据', colSpan }: EmptyStateProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="py-12 text-center text-sm text-[var(--color-text-secondary)]"
      >
        {message}
      </td>
    </tr>
  );
}

export function LoadingState({ colSpan }: { colSpan?: number }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="py-12 text-center text-sm text-[var(--color-text-secondary)]"
      >
        加载中...
      </td>
    </tr>
  );
}
