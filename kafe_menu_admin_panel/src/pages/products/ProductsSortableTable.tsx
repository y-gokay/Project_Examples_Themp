import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { productToFormValues, updateProduct } from '@/services/products';
import { extractErrorMessage } from '@/lib/api';
import { cn, formatPrice, resolveMediaUrl } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Category, Product } from '@/types/api';

interface ProductsSortableTableProps {
  venueId: number;
  categoryFilter: string;
  categories: Category[];
  displayProducts: Product[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}

function SortableProductCard({
  product,
  index,
  showCategoryColumn,
  onEdit,
  onDelete,
  disabled,
}: {
  product: Product;
  index: number;
  showCategoryColumn: boolean;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const thumb = resolveMediaUrl(product.imageUrl);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'overflow-hidden p-4 shadow-sm',
        isDragging && 'relative z-10 ring-2 ring-primary/30',
        !disabled && 'cursor-pointer',
      )}
      onClick={(e) => {
        if (disabled) return;
        const el = e.target as HTMLElement;
        if (el.closest('[data-drag-handle]') || el.closest('button')) return;
        onEdit(product);
      }}
    >
      <div className="flex gap-3">
        <button
          type="button"
          data-drag-handle
          className={cn(
            'mt-1 shrink-0 touch-none self-start rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground',
            disabled && 'pointer-events-none opacity-40',
            !disabled && 'cursor-grab active:cursor-grabbing',
          )}
          aria-label="Sürükleyerek sırayı değiştir"
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex gap-3 border-b border-border pb-3">
            {thumb ? (
              <img
                src={thumb}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover"
              />
            ) : (
              <div className="h-14 w-14 shrink-0 rounded-lg border border-dashed border-border bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold leading-snug">{product.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">Sıra: {index}</p>
            </div>
          </div>
          {showCategoryColumn ? (
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Kategori</span>
              <span className="text-end text-foreground">{product.category?.name ?? '—'}</span>
            </div>
          ) : null}
          <div className="flex justify-between gap-2 text-sm">
            <span className="text-muted-foreground">Fiyat</span>
            <span className="font-medium tabular-nums">{formatPrice(product.price)}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">Durum</span>
            <Badge variant={product.isAvailable ? 'default' : 'secondary'}>
              {product.isAvailable ? 'Satışta' : 'Kapalı'}
            </Badge>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-3" onClick={(e) => e.stopPropagation()}>
            <Button type="button" size="sm" variant="outline" onClick={() => onEdit(product)}>
              <Pencil className="mr-1 h-4 w-4" />
              Düzenle
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(product)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Sil
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SortableProductRow({
  product,
  index,
  showCategoryColumn,
  onEdit,
  onDelete,
  disabled,
}: {
  product: Product;
  index: number;
  showCategoryColumn: boolean;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const thumb = resolveMediaUrl(product.imageUrl);

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && 'relative z-10 bg-muted/80 shadow-md',
        !disabled && 'cursor-pointer',
      )}
      onClick={(e) => {
        if (disabled) return;
        const el = e.target as HTMLElement;
        if (el.closest('[data-drag-handle]') || el.closest('button')) return;
        onEdit(product);
      }}
    >
      <TableCell className="w-12 py-3">
        <button
          type="button"
          data-drag-handle
          className={cn(
            'inline-flex touch-none rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground',
            disabled && 'pointer-events-none opacity-40',
            !disabled && 'cursor-grab active:cursor-grabbing',
          )}
          aria-label="Sürükleyerek sırayı değiştir"
          disabled={disabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="w-14 tabular-nums text-muted-foreground">{index}</TableCell>
      <TableCell className="w-14">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="h-10 w-10 rounded-md border border-border object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-md border border-dashed border-border bg-muted" />
        )}
      </TableCell>
      <TableCell className="font-medium">{product.name}</TableCell>
      {showCategoryColumn ? (
        <TableCell className="text-sm text-muted-foreground">
          {product.category?.name ?? '—'}
        </TableCell>
      ) : null}
      <TableCell className="tabular-nums">{formatPrice(product.price)}</TableCell>
      <TableCell>
        <Badge variant={product.isAvailable ? 'default' : 'secondary'}>
          {product.isAvailable ? 'Satışta' : 'Kapalı'}
        </Badge>
      </TableCell>
      <TableCell className="w-[100px] text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end gap-1">
          <Button type="button" size="icon" variant="ghost" onClick={() => onEdit(product)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function SortableProductBlock({
  venueId,
  title,
  initialProducts,
  showCategoryColumn,
  onEdit,
  onDelete,
}: {
  venueId: number;
  title?: string;
  initialProducts: Product[];
  showCategoryColumn: boolean;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  const isMdUp = useMediaQuery('(min-width: 768px)');
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Product[]>(initialProducts);

  useEffect(() => {
    setItems(initialProducts);
  }, [initialProducts]);

  const reorderMutation = useMutation({
    mutationFn: async (newOrder: Product[]) => {
      await Promise.all(
        newOrder.map((p, index) =>
          updateProduct(p.id, {
            ...productToFormValues(p),
            sortOrder: index,
          }),
        ),
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products', venueId] });
      toast.success('Sıra güncellendi');
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Sıra kaydedilemedi.'));
      void queryClient.invalidateQueries({ queryKey: ['products', venueId] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (reorderMutation.isPending) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    reorderMutation.mutate(next);
  };

  const busy = reorderMutation.isPending;
  const colSpan = showCategoryColumn ? 8 : 7;

  return (
    <div className="mb-6 last:mb-0">
      {title ? (
        <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      ) : null}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {isMdUp ? (
            <div className="overflow-x-auto">
              <Table className="min-w-[720px]">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-12" />
                    <TableHead className="w-14">Sıra</TableHead>
                    <TableHead className="w-14" />
                    <TableHead>Ad</TableHead>
                    {showCategoryColumn ? <TableHead>Kategori</TableHead> : null}
                    <TableHead>Fiyat</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={colSpan}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        Bu kategoride ürün yok
                      </TableCell>
                    </TableRow>
                  ) : (
                    <SortableContext
                      items={items.map((p) => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {items.map((p, index) => (
                        <SortableProductRow
                          key={p.id}
                          product={p}
                          index={index}
                          showCategoryColumn={showCategoryColumn}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          disabled={busy}
                        />
                      ))}
                    </SortableContext>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-3 p-3">
              {items.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Bu kategoride ürün yok
                </p>
              ) : (
                <SortableContext
                  items={items.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((p, index) => (
                    <SortableProductCard
                      key={p.id}
                      product={p}
                      index={index}
                      showCategoryColumn={showCategoryColumn}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      disabled={busy}
                    />
                  ))}
                </SortableContext>
              )}
            </div>
          )}
        </DndContext>
      </div>
    </div>
  );
}

export function ProductsSortableTable({
  venueId,
  categoryFilter,
  categories,
  displayProducts,
  isLoading,
  isError,
  error,
  onRetry,
  onEdit,
  onDelete,
}: ProductsSortableTableProps) {
  const isMdUp = useMediaQuery('(min-width: 768px)');
  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'tr'),
      ),
    [categories],
  );

  const groups = useMemo(() => {
    if (categoryFilter !== 'all') {
      return [
        {
          key: categoryFilter,
          title: undefined as string | undefined,
          products: displayProducts,
        },
      ];
    }
    return sortedCategories
      .map((c) => ({
        key: String(c.id),
        title: c.name,
        products: displayProducts.filter((p) => p.categoryId === c.id),
      }))
      .filter((g) => g.products.length > 0);
  }, [categoryFilter, displayProducts, sortedCategories]);

  if (isError) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card py-10 shadow-sm">
        <EmptyState
          title="Liste yüklenemedi"
          description={extractErrorMessage(error)}
          action={
            <Button type="button" variant="outline" onClick={onRetry}>
              Tekrar dene
            </Button>
          }
        />
      </div>
    );
  }

  if (isLoading) {
    return isMdUp ? (
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[720px]">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-12" />
                <TableHead className="w-14">Sıra</TableHead>
                <TableHead className="w-14" />
                <TableHead>Ad</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-10 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    ) : (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`m-sk-${i}`} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 max-w-[200px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayProducts.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card py-10 shadow-sm">
        <EmptyState title="Kayıt bulunamadı" description="Bu görünümde ürün yok." />
      </div>
    );
  }

  const showCategoryColumn = categoryFilter === 'all';

  return (
    <div className="space-y-2">
      <p className="px-1 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
        Tutamağı sürükleyerek sıralayın; sıra 0, 1, 2… olarak kaydedilir.
      </p>
      {groups.map((g) => (
        <SortableProductBlock
          key={g.key}
          venueId={venueId}
          title={g.title}
          initialProducts={g.products}
          showCategoryColumn={showCategoryColumn}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
