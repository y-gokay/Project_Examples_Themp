import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/common/DataTable';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createAdminUser, listAdminUsers } from '@/services/adminUsers';
import { listVenues } from '@/services/venues';
import { extractErrorMessage } from '@/lib/api';
import type { AdminUser, AdminUserCreateInput } from '@/types/api';
import { AdminUserFormDialog } from './AdminUserFormDialog';

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: 'Süper yönetici',
  VENUE_ADMIN: 'Mekan yöneticisi',
};

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const usersQuery = useQuery({
    queryKey: ['adminUsers'],
    queryFn: listAdminUsers,
  });

  const venuesQuery = useQuery({
    queryKey: ['venues'],
    queryFn: listVenues,
  });

  const createMutation = useMutation({
    mutationFn: (input: AdminUserCreateInput) => createAdminUser(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('Admin kullanıcı oluşturuldu');
      setDialogOpen(false);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Kullanıcı oluşturulamadı.'));
    },
  });

  const columns = useMemo<DataTableColumn<AdminUser>[]>(
    () => [
      { key: 'name', header: 'Ad', cell: (r) => <span className="font-medium">{r.name}</span> },
      { key: 'email', header: 'E-posta', cell: (r) => <span className="text-sm">{r.email}</span> },
      {
        key: 'role',
        header: 'Rol',
        cell: (r) => <Badge variant="secondary">{roleLabel[r.role] ?? r.role}</Badge>,
      },
      {
        key: 'venue',
        header: 'Mekan',
        cell: (r) => (
          <span className="text-sm text-muted-foreground">
            {r.venue?.name ?? (r.role === 'SUPER_ADMIN' ? '—' : `#${r.venueId ?? ''}`)}
          </span>
        ),
      },
      {
        key: 'active',
        header: 'Durum',
        cell: (r) => (
          <Badge variant={r.isActive ? 'default' : 'outline'}>{r.isActive ? 'Aktif' : 'Pasif'}</Badge>
        ),
      },
    ],
    [],
  );

  const venues = venuesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin kullanıcılar"
        description="Panel erişimi olan yöneticileri görüntüleyin ve yeni hesap oluşturun."
        actions={
          <Button type="button" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni admin
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={usersQuery.data}
        isLoading={usersQuery.isLoading}
        rowKey={(r) => r.id}
        emptyState={
          usersQuery.isError ? (
            <EmptyState
              title="Liste yüklenemedi"
              description={extractErrorMessage(usersQuery.error)}
              action={
                <Button type="button" variant="outline" onClick={() => usersQuery.refetch()}>
                  Tekrar dene
                </Button>
              }
            />
          ) : undefined
        }
      />

      <AdminUserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        venues={venues}
        loading={createMutation.isPending}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
      />
    </div>
  );
}
