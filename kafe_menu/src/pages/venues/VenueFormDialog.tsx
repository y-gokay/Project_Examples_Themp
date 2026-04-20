import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Venue } from "@/types/api";

const schema = z.object({
  name: z.string().min(2, "En az 2 karakter"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Küçük harf, rakam ve tire kullanın"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export type VenueFormValues = z.infer<typeof schema>;

interface VenueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue?: Venue | null;
  onSubmit: (values: VenueFormValues) => Promise<void>;
  loading?: boolean;
}

export function VenueFormDialog({
  open,
  onOpenChange,
  venue,
  onSubmit,
  loading,
}: VenueFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VenueFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  useEffect(() => {
    if (!open) return;
    if (venue) {
      reset({
        name: venue.name,
        slug: venue.slug,
        description: venue.description ?? "",
        isActive: venue.isActive,
      });
    } else {
      reset({ name: "", slug: "", description: "", isActive: true });
    }
  }, [open, venue, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{venue ? "Mekanı düzenle" : "Yeni mekan"}</DialogTitle>
          <DialogDescription>
            Mekan bilgilerini kaydettikten sonra kategori ve ürün
            ekleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values);
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="venue-name">Ad</Label>
            <Input id="venue-name" {...register("name")} />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="venue-slug">Slug</Label>
            <Input
              id="venue-slug"
              placeholder="ornek-mekan"
              {...register("slug")}
            />
            {errors.slug ? (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="venue-desc">Açıklama</Label>
            <Textarea id="venue-desc" rows={3} {...register("description")} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Aktif</p>
              <p className="text-xs text-muted-foreground">
                Pasif mekanlar menüde görünmez.
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(v) => setValue("isActive", v)}
              aria-label="Aktif"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Vazgeç
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor…" : venue ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
