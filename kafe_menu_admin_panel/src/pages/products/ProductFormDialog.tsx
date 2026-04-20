import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageDropzone } from '@/components/common/ImageDropzone';
import type { Category, Product, ProductFormValues } from '@/types/api';

/**
 * Aynı kategorideki ürünler arasında bir sonraki sortOrder (0 tabanlı artan).
 * `excludeProductId`: düzenlenen kayıt listede eski kategorideyken çakışmayı saymamak için.
 */
function nextSortOrderInCategory(
  products: Product[],
  categoryId: number,
  excludeProductId?: number,
): number {
  const max = products
    .filter((p) => p.categoryId === categoryId && p.id !== excludeProductId)
    .reduce((m, p) => Math.max(m, p.sortOrder), -1);
  return max + 1;
}

function hasSortOrderConflict(
  products: Product[],
  categoryId: number,
  sortOrder: number,
  excludeProductId?: number,
): boolean {
  return products.some(
    (p) =>
      p.categoryId === categoryId &&
      p.sortOrder === sortOrder &&
      p.id !== excludeProductId,
  );
}

const schema = z.object({
  categoryId: z.coerce.number().int().positive('Kategori seçin'),
  name: z.string().min(2, 'En az 2 karakter'),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative('Geçerli fiyat'),
  isAvailable: z.boolean(),
  sortOrder: z.coerce.number().int(),
  image: z.union([z.instanceof(File), z.null()]).optional(),
});

type FormValues = z.infer<typeof schema>;

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  /** Mekandaki mevcut ürünler — yeni kayıtta kategori içi sıra için */
  existingProducts: Product[];
  product?: Product | null;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  loading?: boolean;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  categories,
  existingProducts,
  product,
  onSubmit,
  loading,
}: ProductFormDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: categories[0]?.id ?? 0,
      name: '',
      description: '',
      price: 0,
      isAvailable: true,
      sortOrder: 0,
      image: undefined,
    },
  });

  const isAvailable = watch('isAvailable');
  const sortOrderRegister = register('sortOrder');
  const existingProductsRef = useRef(existingProducts);
  existingProductsRef.current = existingProducts;

  useEffect(() => {
    if (!open) return;
    if (product) {
      reset({
        categoryId: product.categoryId,
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        isAvailable: product.isAvailable,
        sortOrder: product.sortOrder,
        image: undefined,
      });
    } else {
      const defaultCat = categories[0]?.id ?? 0;
      reset({
        categoryId: defaultCat,
        name: '',
        description: '',
        price: 0,
        isAvailable: true,
        sortOrder: nextSortOrderInCategory(existingProducts, defaultCat),
        image: undefined,
      });
    }
  }, [open, product, categories, existingProducts, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Ürünü düzenle' : 'Yeni ürün'}</DialogTitle>
          <DialogDescription>Kategori, fiyat ve görsel bilgilerini girin.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(async (values) => {
            const excludeId = product?.id;
            if (
              hasSortOrderConflict(
                existingProductsRef.current,
                values.categoryId,
                values.sortOrder,
                excludeId,
              )
            ) {
              setError('sortOrder', {
                type: 'manual',
                message:
                  'Bu sıra numarası seçili kategoride başka bir üründe kullanılıyor. Farklı bir değer girin veya kategori değiştirin.',
              });
              return;
            }
            const payload: ProductFormValues = {
              categoryId: values.categoryId,
              name: values.name,
              description: values.description,
              price: values.price,
              isAvailable: values.isAvailable,
              sortOrder: values.sortOrder,
              image: values.image ?? null,
            };
            await onSubmit(payload);
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(v) => {
                    const cid = Number(v);
                    field.onChange(cid);
                    clearErrors('sortOrder');
                    setValue(
                      'sortOrder',
                      nextSortOrderInCategory(
                        existingProductsRef.current,
                        cid,
                        product?.id,
                      ),
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId ? (
              <p className="text-xs text-destructive">{errors.categoryId.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-name">Ad</Label>
            <Input id="p-name" {...register('name')} />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Açıklama</Label>
            <Textarea id="p-desc" rows={3} {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-price">Fiyat (₺)</Label>
              <Input id="p-price" type="number" step="0.01" {...register('price')} />
              {errors.price ? (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-order">Sıra (menüdeki konum)</Label>
              <Input
                id="p-order"
                type="number"
                step={1}
                name={sortOrderRegister.name}
                ref={sortOrderRegister.ref}
                onBlur={sortOrderRegister.onBlur}
                onChange={(e) => {
                  clearErrors('sortOrder');
                  sortOrderRegister.onChange(e);
                }}
              />
              {errors.sortOrder ? (
                <p className="text-xs text-destructive">{errors.sortOrder.message}</p>
              ) : null}
              <p className="text-[11px] text-muted-foreground">
                Aynı kategoride aynı sıra numarası iki üründe olamaz; küçük sayı önce listelenir.
                Kategori değişince sıra bu kategorinin sonuna ayarlanır.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Satışta</p>
              <p className="text-xs text-muted-foreground">Kapalı ürünler menüde gizlenebilir.</p>
            </div>
            <Switch
              checked={isAvailable}
              onCheckedChange={(v) => setValue('isAvailable', v)}
              aria-label="Satışta"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Görsel</Label>
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImageDropzone
                  value={field.value ?? null}
                  initialPreviewUrl={product?.imageUrl ?? null}
                  onChange={(f) => field.onChange(f)}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Vazgeç
            </Button>
            <Button type="submit" disabled={loading || categories.length === 0}>
              {loading ? 'Kaydediliyor…' : product ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
