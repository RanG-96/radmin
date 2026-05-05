import http from '../http';
import type { Setting } from '../types/setting';

export const settingsApi = {
  get: () => http.get<Setting[]>('/settings'),
  update: (settings: Record<string, string>) =>
    http.put<Setting[]>('/settings', { settings }),
};
