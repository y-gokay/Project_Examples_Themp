import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { CategoriesSortableTable } from './CategoriesSortableTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppStore } from '@/store/useAppStore';
import { useEffectiveVenueId } from '@/hooks/useEffectiveVenueId';
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '@/services/categories';
import { extractErrorMessage } from '@/lib/api';
import type { Category } from '@/types/api';

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const user = useAppStore((s) => s.user);
  const venueId = useEffectiveVenueId();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['categories', venueId],
    queryFn: () => listCategories(venueId!),
    enabled: venueId != null,
  });

  const sorted = useMemo(() => {
    const list = categoriesQuery.data ?? [];
    return [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }, [categoriesQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!venueId) throw new Error('Mekan yok');
      if (editing) {
        return updateCategory(editing.id, { venueId, name, sortOrder });
      }
      return createCategory({ venueId, name, sortOrder });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories', venueId] });
      toast.success(editing ? 'Kategori güncellendi' : 'Kategori oluşturuldu');
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'İşlem başarısız.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories', venueId] });
      toast.success('Kategori silindi');
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Kategori silinemedi. Bağlı ürünler olabilir.'));
    },
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    setName('');
    const max = sorted.reduce((m, c) => Math.max(m, c.sortOrder), 0);
    setSortOrder(max + 1);
    setFormOpen(true);
  }, [sorted]);

  const openEdit = useCallback((c: Category) => {
    setEditing(c);
    setName(c.name);
    setSortOrder(c.sortOrder);
    setFormOpen(true);
  }, []);

  if (!venueId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Kategoriler" description="Ürünleri gruplamak için kategori yönetimi." />
        <EmptyState
          title="Mekan seçilmedi"
          description={
            user?.role === 'SUPER_ADMIN'
              ? 'Üst bardan bir mekan seçin.'
              : 'Hesabınıza atanmış bir mekan bulunamadı.'
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategoriler"
        description={
          user?.role === 'VENUE_ADMIN'
            ? 'Yalnızca kendi mekanınızın kategorilerini yönetirsiniz. Sırayı satır tutamacından sürükleyerek değiştirebilirsiniz.'
            : 'Seçili mekana ait kategoriler. Sırayı satır tutamacından sürükleyerek değiştirebilirsiniz.'
        }
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni kategori
          </Button>
        }
      />

      <CategoriesSortableTable
        venueId={venueId}
        categories={sorted}
        isLoading={categoriesQuery.isLoading}
        isError={categoriesQuery.isError}
        error={categoriesQuery.error}
        onRetry={() => categoriesQuery.refetch()}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Kategoriyi düzenle' : 'Yeni kategori'}</DialogTitle>
            <DialogDescription>Ad ve sıra numarası menüdeki görünümü etkiler.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Ad</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-order">Sıra</Label>
              <Input
                id="cat-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Vazgeç
            </Button>
            <Button
              type="button"
              disabled={!name.trim() || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? 'Kaydediliyor…' : editing ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Kategoriyi sil"
        description={`“${deleteTarget?.name ?? ''}” kalıcı olarak silinecek. Bağlı ürün varsa işlem reddedilir.`}
        destructive
        confirmLabel="Sil"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
