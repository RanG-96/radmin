import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../lib/api/users';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormSelect } from '../components/ui/Select';
import { FormCheckbox } from '../components/ui/Checkbox';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../components/ui/AlertDialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState, LoadingState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/crud/PageHeader';
import { FilterBar } from '../components/crud/FilterBar';
import { DataTable } from '../components/crud/DataTable';
import { RowActions } from '../components/crud/RowActions';
import { FormDialog } from '../components/crud/FormDialog';
import { StatusBadge } from '../components/crud/StatusBadge';
import { useFormError } from '../hooks/useFormError';
import type { AdminCreateUserInput, UpdateUserInput, User } from '../lib/types/user';

const roleOptions = [
  { value: 'user', label: '普通用户' },
  { value: 'admin', label: '管理员' },
];

interface UserFormValues {
  username: string;
  email: string;
  password?: string;
  role: string;
  is_active?: boolean;
}

function UserForm({ user, errorMessage, onSubmit, onCancel, isSubmitting }: {
  user?: User;
  errorMessage?: string | null;
  onSubmit: (data: UserFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role || 'user');
  const [isActive, setIsActive] = useState(user?.is_active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onSubmit({ username, email, role, is_active: isActive });
    } else {
      onSubmit({ username, email, password, role });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Input label="用户名" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <Input label="邮箱" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      {!user && (
        <Input
          label="密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          description="至少 6 个字符"
          required
          minLength={6}
        />
      )}
      <FormSelect label="角色" value={role} onValueChange={setRole} options={roleOptions} required />
      {user && (
        <FormCheckbox
          label="启用"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
      )}
      {errorMessage && <p className="text-sm text-[var(--color-error)]">{errorMessage}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>取消</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (user ? '保存中...' : '创建中...') : user ? '保存' : '创建'}
        </Button>
      </div>
    </form>
  );
}

export function Users() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const formError = useFormError();
  const pageError = useFormError();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminApi.listUsers({ page, per_page: 20, q: search || undefined }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: AdminCreateUserInput) => adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDialogOpen(false);
      formError.clearError();
      pageError.clearError();
    },
    onError: (error) => formError.captureError(error, '创建用户失败'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) => adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDialogOpen(false);
      setEditingUser(null);
      formError.clearError();
      pageError.clearError();
    },
    onError: (error) => formError.captureError(error, '更新用户失败'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      adminApi.updateUser(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      pageError.clearError();
    },
    onError: (error) => pageError.captureError(error, '更新用户状态失败'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      pageError.clearError();
    },
    onError: (error) => pageError.captureError(error, '删除用户失败'),
  });

  const handleCreate = (data: UserFormValues) => createMutation.mutate(data as AdminCreateUserInput);
  const handleUpdate = (data: UpdateUserInput) => {
    if (editingUser) updateMutation.mutate({ id: editingUser.id, data });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const openCreate = useCallback(() => {
    setEditingUser(null);
    formError.clearError();
    setDialogOpen(true);
  }, [formError]);

  const openEdit = useCallback((user: User) => {
    setEditingUser(user);
    formError.clearError();
    setDialogOpen(true);
  }, [formError]);

  const handleToggleStatus = useCallback((user: User) => {
    pageError.clearError();
    toggleStatusMutation.mutate({ id: user.id, is_active: !user.is_active });
  }, [pageError, toggleStatusMutation]);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="用户管理"
        description="管理登录账号、角色权限和启用状态。常用操作已直接显示在列表中。"
        actions={<Button onClick={openCreate}>新增用户</Button>}
      />

      {pageError.error && (
        <div className="rounded-md border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">
          {pageError.error}
        </div>
      )}

      <DataTable
        filter={(
          <FilterBar>
            <Input
              placeholder="搜索用户..."
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
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="min-w-[220px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingState colSpan={6} />
            ) : data?.data.length === 0 ? (
              <EmptyState message="暂无用户" colSpan={6} />
            ) : (
              data?.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{user.email}</TableCell>
                  <TableCell>
                    <StatusBadge tone={user.role === 'admin' ? 'accent' : 'neutral'}>
                      {user.role === 'admin' ? '管理员' : '普通用户'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={user.is_active ? 'success' : 'danger'}>
                      {user.is_active ? '启用' : '禁用'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{new Date(user.created_at).toLocaleDateString('zh-CN')}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <RowActions>
                      <Button variant="secondary" size="sm" className="shrink-0" onClick={() => openEdit(user)}>编辑</Button>
                      <Button variant="secondary" size="sm" className="shrink-0" onClick={() => handleToggleStatus(user)}>
                        {user.is_active ? '禁用' : '启用'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="shrink-0 text-[var(--color-error)] hover:text-[var(--color-error)]"
                        onClick={() => setDeleteTarget(user)}
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
        title={editingUser ? '编辑用户' : '新增用户'}
      >
        <UserForm
          key={editingUser?.id ?? 'create'}
          user={editingUser || undefined}
          errorMessage={formError.error}
          onSubmit={editingUser ? handleUpdate : handleCreate}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={() => { setDialogOpen(false); setEditingUser(null); }}
        />
      </FormDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除用户</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除用户 &ldquo;{deleteTarget?.username}&rdquo; 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-[var(--color-error)] hover:bg-[var(--color-error)]/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
