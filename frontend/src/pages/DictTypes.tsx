import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { dictApi, type DictType, type CreateDictTypeInput, type UpdateDictTypeInput } from '../lib/api';
import { getApiErrorMessage } from '../lib/error';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormCheckbox } from '../components/ui/Checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from '../components/ui/AlertDialog';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState, LoadingState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/crud/PageHeader';
import { FilterBar } from '../components/crud/FilterBar';
import { DataTable } from '../components/crud/DataTable';
import { RowActions } from '../components/crud/RowActions';
import { FormDialog } from '../components/crud/FormDialog';
import { StatusBadge } from '../components/crud/StatusBadge';

interface DictTypeFormValues {
  name: string;
  type_code: string;
  remark?: string;
  status: boolean;
}

function DictTypeForm({
  dictType,
  errorMessage,
  onSubmit,
  onCancel,
}: {
  dictType?: DictType;
  errorMessage?: string | null;
  onSubmit: (data: DictTypeFormValues) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(dictType?.name ?? '');
  const [typeCode, setTypeCode] = useState(dictType?.type_code ?? '');
  const [remark, setRemark] = useState(dictType?.remark ?? '');
  const [status, setStatus] = useState(dictType?.status ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, type_code: typeCode, remark: remark || undefined, status });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">选项组名称</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：性别、用户状态、订单状态" required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">系统编码</label>
        <Input
          value={typeCode}
          onChange={(e) => setTypeCode(e.target.value)}
          placeholder="如：gender"
          required
          disabled={!!dictType}
        />
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">供系统内部使用，创建后不建议修改。</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">用途说明</label>
        <Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="如：用于用户资料页的性别选择" />
      </div>
      <FormCheckbox
        label="启用"
        checked={status}
        onCheckedChange={setStatus}
      />
      {errorMessage && <p className="text-sm text-[var(--color-error)]">{errorMessage}</p>}
      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit">{dictType ? '更新' : '创建'}</Button>
      </div>
    </form>
  );
}

export function DictTypes() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DictType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DictType | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dict-types', page, search],
    queryFn: () => dictApi.listTypes({ page, per_page: 20, q: search || undefined }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDictTypeInput) => dictApi.createType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dict-types'] });
      queryClient.invalidateQueries({ queryKey: ['dict'] });
      setDialogOpen(false);
      setFormError(null);
      setPageError(null);
    },
    onError: (error) => setFormError(getApiErrorMessage(error, '创建选项组失败')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDictTypeInput }) =>
      dictApi.updateType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dict-types'] });
      queryClient.invalidateQueries({ queryKey: ['dict'] });
      setDialogOpen(false);
      setEditing(null);
      setFormError(null);
      setPageError(null);
    },
    onError: (error) => setFormError(getApiErrorMessage(error, '更新选项组失败')),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      dictApi.updateType(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dict-types'] });
      queryClient.invalidateQueries({ queryKey: ['dict'] });
      setPageError(null);
    },
    onError: (error) => setPageError(getApiErrorMessage(error, '更新选项组状态失败')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dictApi.deleteType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dict-types'] });
      queryClient.invalidateQueries({ queryKey: ['dict'] });
      setDeleteTarget(null);
      setPageError(null);
    },
    onError: (error) => setPageError(getApiErrorMessage(error, '删除选项组失败')),
  });

  const handleSubmit = (formData: DictTypeFormValues) => {
    if (editing) {
      const updateData: UpdateDictTypeInput = {
        name: formData.name,
        type_code: formData.type_code,
        remark: formData.remark,
        status: formData.status,
      };
      updateMutation.mutate({ id: editing.id, data: updateData });
    } else {
      const createData: CreateDictTypeInput = {
        name: formData.name,
        type_code: formData.type_code,
        remark: formData.remark,
        status: formData.status,
      };
      createMutation.mutate(createData);
    }
  };

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((dt: DictType) => {
    setEditing(dt);
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const handleToggleStatus = useCallback((dt: DictType) => {
    setPageError(null);
    toggleStatusMutation.mutate({
      id: dt.id,
      status: !dt.status,
    });
  }, [toggleStatusMutation]);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="选项配置"
        description="用来管理表单中的下拉选项、状态选项和枚举配置。先创建一个选项组，再为它添加可选项。"
        actions={<Button onClick={openCreate}>新增选项组</Button>}
      />

      {pageError && (
        <div className="rounded-md border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">
          {pageError}
        </div>
      )}

      <DataTable
        filter={(
          <FilterBar>
            <Input
              placeholder="搜索..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-sm"
            />
          </FilterBar>
        )}
        pagination={data && (
          <Pagination
            page={page}
            total={data.total}
            perPage={data.per_page}
            onPageChange={setPage}
          />
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>选项组</TableHead>
              <TableHead>系统编码</TableHead>
              <TableHead>可选项数</TableHead>
              <TableHead>用途说明</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="min-w-[240px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingState colSpan={6} />
            ) : !data?.data.length ? (
              <EmptyState message="还没有选项组。先新增一个选项组，再为它配置可选项。" colSpan={6} />
            ) : (
              data.data.map((dt) => (
                <TableRow key={dt.id}>
                  <TableCell className="font-medium">{dt.name}</TableCell>
                  <TableCell className="font-mono text-sm text-[var(--color-text-secondary)]">{dt.type_code}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{dt.item_count}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{dt.remark ?? '-'}</TableCell>
                  <TableCell>
                    <StatusBadge tone={dt.status ? 'success' : 'neutral'}>
                      {dt.status ? '启用' : '禁用'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <RowActions>
                      <Button variant="secondary" size="sm" className="shrink-0" onClick={() => navigate(`/dict-items/${dt.id}`)}>管理选项</Button>
                      <Button variant="secondary" size="sm" className="shrink-0" onClick={() => openEdit(dt)}>编辑</Button>
                      <Button variant="secondary" size="sm" className="shrink-0" onClick={() => handleToggleStatus(dt)}>
                        {dt.status ? '禁用' : '启用'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="shrink-0 text-[var(--color-error)] hover:text-[var(--color-error)]"
                        onClick={() => setDeleteTarget(dt)}
                        disabled={dt.item_count > 0}
                        title={dt.item_count > 0 ? '请先清空可选项后再删除该选项组' : undefined}
                      >
                        删除
                      </Button>
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
        title={editing ? '编辑选项组' : '新增选项组'}
      >
        <DictTypeForm
          key={editing?.id ?? 'create'}
          dictType={editing ?? undefined}
          errorMessage={formError}
          onSubmit={handleSubmit}
          onCancel={() => { setDialogOpen(false); setEditing(null); }}
        />
      </FormDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>删除选项组</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除空选项组 <strong>{deleteTarget?.name}</strong> 吗？此操作不可撤销。
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
