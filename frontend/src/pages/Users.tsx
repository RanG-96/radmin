import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type User, type AdminCreateUserInput, type UpdateUserInput } from '../lib/api';
import { getApiErrorMessage } from '../lib/error';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormSelect } from '../components/ui/Select';
import { FormCheckbox } from '../components/ui/Checkbox';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../components/ui/AlertDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/Dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState, LoadingState } from '../components/ui/EmptyState';

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

function UserForm({ user, errorMessage, onSubmit, onCancel }: {
  user?: User;
  errorMessage?: string | null;
  onSubmit: (data: UserFormValues) => void;
  onCancel: () => void;
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
      {!user && <Input label="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />}
      <FormSelect label="角色" value={role} onValueChange={setRole} options={roleOptions} />
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
        <Button type="submit">{user ? '保存' : '创建'}</Button>
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
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminApi.listUsers({ page, per_page: 20, q: search || undefined }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: AdminCreateUserInput) => adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDialogOpen(false);
      setFormError(null);
      setPageError(null);
    },
    onError: (error) => setFormError(getApiErrorMessage(error, '创建用户失败')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) => adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDialogOpen(false);
      setEditingUser(null);
      setFormError(null);
      setPageError(null);
    },
    onError: (error) => setFormError(getApiErrorMessage(error, '更新用户失败')),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      adminApi.updateUser(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setPageError(null);
    },
    onError: (error) => setPageError(getApiErrorMessage(error, '更新用户状态失败')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setPageError(null);
    },
    onError: (error) => setPageError(getApiErrorMessage(error, '删除用户失败')),
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
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((user: User) => {
    setEditingUser(user);
    setFormError(null);
    setDialogOpen(true);
  }, []);

  const handleToggleStatus = useCallback((user: User) => {
    setPageError(null);
    toggleStatusMutation.mutate({ id: user.id, is_active: !user.is_active });
  }, [toggleStatusMutation]);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="grid gap-1">
          <h2 className="text-2xl font-semibold text-[var(--color-text)]">用户管理</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            管理登录账号、角色权限和启用状态。常用操作已直接显示在列表中。
          </p>
        </div>
        <Button onClick={openCreate}>新增用户</Button>
      </div>

      {pageError && (
        <div className="rounded-md border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">
          {pageError}
        </div>
      )}

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="border-b border-[var(--color-border)] p-4">
          <Input placeholder="搜索用户..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-sm" />
        </div>

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
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {user.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.is_active ? '启用' : '禁用'}
                    </span>
                  </TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{new Date(user.created_at).toLocaleDateString('zh-CN')}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-wrap items-center gap-2">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {data && (
          <Pagination
            page={page}
            total={data.total}
            perPage={data.per_page}
            onPageChange={setPage}
          />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? '编辑用户' : '新增用户'}</DialogTitle>
          </DialogHeader>
          <UserForm
            key={editingUser?.id ?? 'create'}
            user={editingUser || undefined}
            errorMessage={formError}
            onSubmit={editingUser ? handleUpdate : handleCreate}
            onCancel={() => { setDialogOpen(false); setEditingUser(null); }}
          />
        </DialogContent>
      </Dialog>

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
