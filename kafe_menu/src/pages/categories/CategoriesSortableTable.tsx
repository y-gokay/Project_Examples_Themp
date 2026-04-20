import { useEffect, useState } from 'react';
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
import { EmptyState } from '@/components/common/EmptyState';
import { updateCategory } from '@/services/categories';
import { extractErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Category } from '@/types/api';

interface CategoriesSortableTableProps {
  venueId: number;
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}

function SortableCategoryCard({
  category,
  index,
  onEdit,
  onDelete,
  disabled,
}: {
  category: Category;
  index: number;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-4 shadow-sm',
        isDragging && 'relative z-10 ring-2 ring-primary/30',
        !disabled && 'cursor-pointer',
      )}
      onClick={(e) => {
        if (disabled) return;
        const el = e.target as HTMLElement;
        if (el.closest('[data-drag-handle]') || el.closest('button')) return;
        onEdit(category);
      }}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          data-drag-handle
          className={cn(
            'mt-0.5 inline-flex shrink-0 touch-none rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground',
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
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-base font-semibold leading-snug">{category.name}</p>
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Sıra</span>
            <span className="tabular-nums font-medium text-foreground">{index + 1}</span>
          </div>
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Ürün</span>
            <span className="text-foreground">{category._count?.products ?? '—'}</span>
          </div>
          <div
            className="flex justify-end gap-1 border-t border-border pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            <Button type="button" size="sm" variant="outline" onClick={() => onEdit(category)}>
              <Pencil className="mr-1 h-4 w-4" />
              Düzenle
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(category)}
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

function SortableRow({
  category,
  index,
  onEdit,
  onDelete,
  disabled,
}: {
  category: Category;
  index: number;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
        onEdit(category);
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
      <TableCell className="tabular-nums text-muted-foreground">{index + 1}</TableCell>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {category._count?.products ?? '—'}
      </TableCell>
      <TableCell className="w-[120px] text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end gap-1">
          <Button type="button" size="icon" variant="ghost" onClick={() => onEdit(category)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function CategoriesSortableTable({
  venueId,
  categories: serverCategories,
  isLoading,
  isError,
  error,
  onRetry,
  onEdit,
  onDelete,
}: CategoriesSortableTableProps) {
  const isMdUp = useMediaQuery('(min-width: 768px)');
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Category[]>(serverCategories);

  useEffect(() => {
    setItems(serverCategories);
  }, [serverCategories]);

  const reorderMutation = useMutation({
    mutationFn: async (newOrder: Category[]) => {
      await Promise.all(
        newOrder.map((c, index) =>
          updateCategory(c.id, {
            venueId: c.venueId,
            name: c.name,
            sortOrder: index,
          }),
        ),
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories', venueId] });
      toast.success('Sıra güncellendi');
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, 'Sıra kaydedilemedi.'));
      void queryClient.invalidateQueries({ queryKey: ['categories', venueId] });
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

  const busy = reorderMutation.isPending;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {isMdUp ? (
          <div className="overflow-x-auto">
            <Table className="min-w-[520px]">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-12" />
                  <TableHead className="w-16">Sıra</TableHead>
                  <TableHead>Ad</TableHead>
                  <TableHead>Ürün</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Kayıt bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext
                    items={items.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.map((cat, index) => (
                      <SortableRow
                        key={cat.id}
                        category={cat}
                        index={index}
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
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`m-sk-${i}`} className="space-y-2 rounded-xl border border-border p-4">
                  <Skeleton className="h-5 max-w-[180px]" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))
            ) : items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Kayıt bulunamadı</p>
            ) : (
              <SortableContext
                items={items.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((cat, index) => (
                  <SortableCategoryCard
                    key={cat.id}
                    category={cat}
                    index={index}
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
  );
}
