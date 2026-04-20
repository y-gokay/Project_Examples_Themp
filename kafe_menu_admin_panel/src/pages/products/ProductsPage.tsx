import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';
import { useEffectiveVenueId } from '@/hooks/useEffectiveVenueId';
import { listCategories } from '@/services/categories';
import { createProduct, deleteProduct, listProducts, updateProduct } from '@/services/products';
import { extractErrorMessage } from '@/lib/api';
import type { Product, ProductFormValues } from '@/types/api';
import { ProductFormDialog } from './ProductFormDialog';
import { ProductsSortableTable } from './ProductsSortableTable';

export function ProductsPage() {
  const queryClient = useQueryClient();
  const user = useAppStore((s) => s.user);
  const venueId = useEffectiveVenueId();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['categories', venueId],
    queryFn: () => listCategories(venueId!),
    enabled: venueId != null,
  });

  const productsQuery = useQuery({
    queryKey: ['products', venueId],
    queryFn: () => listProducts(venueId!),
    enabled: venueId != null,
  });

  const categories = categoriesQuery.data ?? [];
  const allProducts = productsQuery.data ?? [];

  const filtered = useMemo(() => {
    if (categoryFilter === 'all') return allProducts;
    const cid = Number(categoryFilter);
    return allProducts.filter((p) => p.categoryId === cid);
  }, [allProducts, categoryFilter]);

  /** Görünüm: kategori sırası → ürün sortOrder → ad (menüye yakın sıra) */
  const sortedFiltered = useMemo(() => {
    const catRank = new Map(categories.map((c) => [c.id, c.sortOrder]));
    return [...filtered].sort((a, b) => {
      const ra = catRank.get(a.categoryId) ?? 0;
      const rb = catRank.get(b.categoryId) ?? 0;
      if (ra !== rb) return ra - rb;
      return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'tr');
    });
  }, [filtered, categories]);

  const saveMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (!venueId) throw new Error('Mekan yok');
      if (editing) {
        return updateProduct(editing.id, values);
      }
      return createProduct(venueId, values);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products', venueId] });
      toast.success(editing ? 'Ürün güncellendi' : 'Ürün oluşturuldu');
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Ürün kaydedilemedi.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products', venueId] });
      toast.success('Ürün silindi');
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Ürün silinemedi.'));
    },
  });

  if (!venueId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ürünler" />
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
        title="Ürünler"
        description="Tutup sürükleyerek sıralayın veya formdan düzenleyin. Yeni ürün seçili kategoride en sona eklenir."
        actions={
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            disabled={categories.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Yeni ürün
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Kategori filtresi</span>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {categories.length === 0 && !categoriesQuery.isLoading ? (
        <EmptyState
          title="Önce kategori oluşturun"
          description="Ürün eklemek için en az bir kategori tanımlanmalıdır."
        />
      ) : (
        <ProductsSortableTable
          venueId={venueId}
          categoryFilter={categoryFilter}
          categories={categories}
          displayProducts={sortedFiltered}
          isLoading={productsQuery.isLoading || categoriesQuery.isLoading}
          isError={productsQuery.isError}
          error={productsQuery.error}
          onRetry={() => productsQuery.refetch()}
          onEdit={(p) => {
            setEditing(p);
            setFormOpen(true);
          }}
          onDelete={setDeleteTarget}
        />
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) setEditing(null);
        }}
        categories={categories}
        existingProducts={allProducts}
        product={editing}
        loading={saveMutation.isPending}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Ürünü sil"
        description={`“${deleteTarget?.name ?? ''}” kalıcı olarak silinecek.`}
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
