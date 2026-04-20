import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { createVenue, listVenues, updateVenue } from '@/services/venues';
import { extractErrorMessage } from '@/lib/api';
import type { Venue } from '@/types/api';
import { VenueFormDialog, type VenueFormValues } from './VenueFormDialog';

export function VenuesListPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Venue | null>(null);

  const venuesQuery = useQuery({
    queryKey: ['venues'],
    queryFn: listVenues,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, values }: { id?: number; values: VenueFormValues }) => {
      if (id != null) {
        return updateVenue(id, {
          name: values.name,
          slug: values.slug,
          description: values.description?.trim() ? values.description.trim() : null,
          isActive: values.isActive,
        });
      }
      return createVenue({
        name: values.name,
        slug: values.slug,
        description: values.description?.trim() || undefined,
        isActive: values.isActive,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast.success('Mekan kaydedildi');
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Mekan kaydedilemedi.'));
    },
  });

  const columns = useMemo<DataTableColumn<Venue>[]>(
    () => [
      { key: 'name', header: 'Ad', cell: (r) => <span className="font-medium">{r.name}</span> },
      { key: 'slug', header: 'Slug', cell: (r) => <code className="text-xs">{r.slug}</code> },
      {
        key: 'description',
        header: 'Açıklama',
        cell: (r) => (
          <span className="line-clamp-2 max-w-xs text-sm text-muted-foreground">
            {r.description ?? '—'}
          </span>
        ),
      },
      {
        key: 'isActive',
        header: 'Durum',
        cell: (r) => (
          <Badge variant={r.isActive ? 'default' : 'secondary'}>
            {r.isActive ? 'Aktif' : 'Pasif'}
          </Badge>
        ),
      },
      {
        key: 'counts',
        header: 'Sayılar',
        cell: (r) => (
          <span className="text-sm text-muted-foreground">
            Kategori: {r._count?.categories ?? '—'}
            {r._count?.products != null ? ` · Ürün: ${r._count.products}` : ''}
            {` · Admin: ${r._count?.admins ?? '—'}`}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mekanlar"
        description="QR menü mekanlarını oluşturun ve düzenleyin."
        actions={
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Yeni mekan
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={venuesQuery.data}
        isLoading={venuesQuery.isLoading}
        rowKey={(r) => r.id}
        emptyState={
          venuesQuery.isError ? (
            <EmptyState
              title="Liste yüklenemedi"
              description={extractErrorMessage(venuesQuery.error)}
              action={
                <Button type="button" variant="outline" onClick={() => venuesQuery.refetch()}>
                  Tekrar dene
                </Button>
              }
            />
          ) : undefined
        }
        onRowClick={(row) => {
          setEditing(row);
          setDialogOpen(true);
        }}
      />

      <VenueFormDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        venue={editing}
        loading={saveMutation.isPending}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync({ id: editing?.id, values });
        }}
      />
    </div>
  );
}
