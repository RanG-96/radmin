import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dictApi } from '../lib/api/dict';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormCheckbox } from '../components/ui/Checkbox';
import { Textarea } from '../components/ui/Textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '../components/ui/AlertDialog';
import { EmptyState, LoadingState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/crud/PageHeader';
import { DataTable } from '../components/crud/DataTable';
import { RowActions } from '../components/crud/RowActions';
import { FormDialog } from '../components/crud/FormDialog';
import { StatusBadge } from '../components/crud/StatusBadge';
import { useFormError } from '../hooks/useFormError';
import type { CreateDictItemInput, DictItem, UpdateDictItemInput } from '../lib/types/dict';

interface DictItemFormValues {
  dict_type_id: string;
  label: string;
  value: string;
  sort_order?: number;
  remark?: string;
  status: boolean;
}

function DictItemForm({
  item,
  dictTypeId,
  errorMessage,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  item?: DictItem;
  dictTypeId: string;
  errorMessage?: string | null;
  onSubmit: (data: DictItemFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const [label, setLabel] = useState(item?.label ?? '');
  const [value, setValue] = useState(item?.value ?? '');
  const [sortOrder, setSortOrder] = useState(item?.sort_order?.toString() ?? '0');
  const [remark, setRemark] = useState(item?.remark ?? '');
  const [status, setStatus] = useState(item?.status ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      dict_type_id: dictTypeId,
      label,
      value,
      sort_order: parseInt(sortOrder) || 0,
      remark: remark || undefined,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Input label="显示名称" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="如：男、已启用、待支付" required />
      <Input
        label="实际值"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="如：male、active、pending"
        description="系统保存和接口返回时使用这个值。"
        required
      />
      <Input label="排序" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
      <Textarea
        label="补充说明"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        placeholder="可选，用来补充说明该选项的适用场景"
      />
      <FormCheckbox
        label="启用"
        checked={status}
        onCheckedChange={setStatus}
      />
      {errorMessage && <p className="text-sm text-[var(--color-error)]">{errorMessage}</p>}
      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (item ? '更新中...' : '创建中...') : item ? '更新' : '创建'}
        </Button>
      </div>
    </form>
  );
}

export function DictItems() {
  const { typeId } = useParams<{ typeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DictItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DictItem | null>(null);
  const formError = useFormError();
  const pageError = useFormError();

  const { data: dictType, isLoading: isTypeLoading } = useQuery({
    queryKey: ['admin-dict-type', typeId],
    queryFn: () => dictApi.getType(typeId!).then((r) => r.data),
    enabled: !!typeId,
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['admin-dict-items', typeId],
    queryFn: () => dictApi.listItems(typeId!).then((r) => r.data),
    enabled: !!typeId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDictItemInput) => dictApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dict-items', typeId] });
      queryClient.invalidateQueries({ queryKey: ['admin-dict-type', typeId] });
      queryClient.invalidateQueries({ queryKey: ['admin-dict-types'] });
      queryClient.invalidateQueries({ queryKey: ['dict'] });
      setDialogOpen(false);
      formError.clearError();
      pageError.clearError();
    },
    onError: (error) => formError.captureError(error, '创建可选项失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDictItemInput }) =>
      dictApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dict-items', typeId] });
      queryClient.invalidateQueries({ queryKey: ['dict'] });
      setDialogOpen(false);
      setEditing(null);
      formError.clearError();
      pageError.clearError();
    },
    onError: (error) => formError.captureError(error, '更新可选项失败'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      dictApi.updateItem(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dict-items', typeId] });
      queryClient.invalidateQueries({ queryKey: ['dict'] });
      pageError.clearError();
    },
    onError: (error) => pageError.captureError(error, '更新可选项状态失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dictApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dict-items', typeId] });
      queryClient.invalidateQueries({ queryKey: ['admin-dict-type', typeId] });
      queryClient.invalidateQueries({ queryKey: ['admin-dict-types'] });
      queryClient.invalidateQueries({ queryKey: ['dict'] });
      setDeleteTarget(null);
      pageError.clearError();
    },
    onError: (error) => pageError.captureError(error, '删除可选项失败'),
  });

  const handleSubmit = (formData: DictItemFormValues) => {
    if (editing) {
      const updateData: UpdateDictItemInput = {
        label: formData.label,
        value: formData.value,
        sort_order: formData.sort_order,
        remark: formData.remark,
        status: formData.status,
      };
      updateMutation.mutate({ id: editing.id, data: updateData });
    } else {
      const createData: CreateDictItemInput = {
        dict_type_id: formData.dict_type_id,
        label: formData.label,
        value: formData.value,
        sort_order: formData.sort_order,
        remark: formData.remark,
        status: formData.status,
      };
      createMutation.mutate(createData);
    }
  };

  const openCreate = useCallback(() => {
    setEditing(null);
    formError.clearError();
    setDialogOpen(true);
  }, [formError]);

  const openEdit = useCallback((item: DictItem) => {
    setEditing(item);
    formError.clearError();
    setDialogOpen(true);
  }, [formError]);

  const handleToggleStatus = useCallback((item: DictItem) => {
    pageError.clearError();
    toggleStatusMutation.mutate({
      id: item.id,
      status: !item.status,
    });
  }, [pageError, toggleStatusMutation]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => navigate('/dict-types')}
        >
          返回
        </Button>
        <PageHeader
          title="管理可选项"
          description={
            isTypeLoading
              ? '正在加载所属选项组...'
              : dictType
                ? `${dictType.name} · ${dictType.remark ?? '用于表单和状态选择'} · 系统编码：${dictType.type_code}`
                : typeId
          }
          actions={<Button onClick={openCreate}>新增可选项</Button>}
        />
      </div>

      {pageError.error && (
        <div className="rounded-md border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">
          {pageError.error}
        </div>
      )}

      <DataTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>显示名称</TableHead>
              <TableHead>实际值</TableHead>
              <TableHead>排序</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="min-w-[180px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingState colSpan={5} />
            ) : !items?.length ? (
              <EmptyState message="当前选项组还没有可选项，先新增一个可选项。" colSpan={5} />
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell className="font-mono text-sm text-[var(--color-text-secondary)]">{item.value}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{item.sort_order}</TableCell>
                  <TableCell>
                    <StatusBadge tone={item.status ? 'success' : 'neutral'}>
                      {item.status ? '启用' : '禁用'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <RowActions>
                      <Button variant="secondary" size="sm" className="shrink-0" onClick={() => openEdit(item)}>编辑</Button>
                      <Button variant="secondary" size="sm" className="shrink-0" onClick={() => handleToggleStatus(item)}>
                        {item.status ? '禁用' : '启用'}
                      </Button>
                      <Button variant="secondary" size="sm" className="shrink-0 text-[var(--color-error)] hover:text-[var(--color-error)]" onClick={() => setDeleteTarget(item)}>删除</Button>
                    </RowActions>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DataTable>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? '编辑可选项' : '新增可选项'}
      >
        <DictItemForm
          key={editing?.id ?? 'create'}
          item={editing ?? undefined}
          dictTypeId={typeId!}
          errorMessage={formError.error}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => { setDialogOpen(false); setEditing(null); }}
        />
      </FormDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>删除可选项</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除可选项 <strong>{deleteTarget?.label}</strong> 吗？
          </AlertDialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              删除
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
