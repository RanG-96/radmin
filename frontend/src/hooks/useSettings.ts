import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../lib/api/settings';
import type { Setting } from '../lib/types/setting';

export function useSettings() {
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((r) => r.data),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const getSetting = (key: string, fallback = ''): string => {
    if (!data) return fallback;
    const found = data.find((s: Setting) => s.key === key);
    return found?.value || fallback;
  };

  return { settings: data, isLoading, getSetting };
}
