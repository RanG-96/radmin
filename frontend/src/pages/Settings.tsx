import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function Settings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const { isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((r) => {
      const map: Record<string, string> = {};
      r.data.forEach((s) => { map[s.key] = s.value; });
      setForm(map);
      return r.data;
    }),
  });

  const updateMutation = useMutation({
    mutationFn: () => settingsApi.update(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div className="text-[var(--color-text-secondary)]">加载中...</div>;
  }

  const fields = [
    { key: 'site_title', label: '站点标题', placeholder: 'Radmin', type: 'text' },
    { key: 'site_description', label: '站点描述', placeholder: '管理面板', type: 'text' },
    { key: 'site_logo', label: 'Logo 地址', placeholder: 'https://example.com/logo.png', type: 'text' },
    { key: 'site_footer', label: '页脚文本', placeholder: '留空则不显示页脚', type: 'textarea' },
  ];

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-semibold text-[var(--color-text)]">系统设置</h2>
      <div className="max-w-2xl rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
        <div className="grid gap-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1"
                  value={form[field.key] ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              ) : (
                <Input
                  value={form[field.key] ?? ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? '保存中...' : '保存设置'}
          </Button>
          {saved && <span className="text-sm text-green-600">保存成功</span>}
          {updateMutation.isError && <span className="text-sm text-[var(--color-error)]">保存失败</span>}
        </div>
      </div>
    </div>
  );
}
