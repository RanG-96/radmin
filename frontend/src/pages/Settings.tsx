import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../lib/api/settings';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { PageHeader } from '../components/crud/PageHeader';
import { useFormError } from '../hooks/useFormError';

export function Settings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const saveError = useFormError();

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
      saveError.clearError();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (error) => saveError.captureError(error, '保存失败'),
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
      <PageHeader
        title="系统设置"
        description="集中维护站点名称、说明和页脚等基础展示配置。"
      />
      <div className="max-w-2xl rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
        <div className="grid gap-4">
          {fields.map((field) => (
            field.type === 'textarea' ? (
              <Textarea
                key={field.key}
                label={field.label}
                value={form[field.key] ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            ) : (
              <Input
                key={field.key}
                label={field.label}
                value={form[field.key] ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            )
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? '保存中...' : '保存设置'}
          </Button>
          {saved && <span className="text-sm text-green-600">保存成功</span>}
          {saveError.error && <span className="text-sm text-[var(--color-error)]">{saveError.error}</span>}
        </div>
      </div>
    </div>
  );
}
