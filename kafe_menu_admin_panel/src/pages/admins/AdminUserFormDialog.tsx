import { useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdminUserCreateInput, Role } from '@/types/api';
import type { Venue } from '@/types/api';

const baseSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter'),
  email: z.string().email('Geçerli e-posta'),
  password: z.string().min(6, 'En az 6 karakter'),
  role: z.enum(['SUPER_ADMIN', 'VENUE_ADMIN']),
  venueId: z.coerce.number().nullable(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof baseSchema>;

const schema = baseSchema.superRefine((data, ctx) => {
  if (data.role === 'VENUE_ADMIN' && (data.venueId == null || Number.isNaN(data.venueId))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Mekan yöneticisi için mekan seçilmeli',
      path: ['venueId'],
    });
  }
});

interface AdminUserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venues: Venue[];
  onSubmit: (values: AdminUserCreateInput) => Promise<void>;
  loading?: boolean;
}

export function AdminUserFormDialog({
  open,
  onOpenChange,
  venues,
  onSubmit,
  loading,
}: AdminUserFormDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'VENUE_ADMIN',
      venueId: venues[0]?.id ?? null,
      isActive: true,
    },
  });

  const role = watch('role');
  const isActive = watch('isActive');

  useEffect(() => {
    if (!open) return;
    reset({
      name: '',
      email: '',
      password: '',
      role: 'VENUE_ADMIN',
      venueId: venues[0]?.id ?? null,
      isActive: true,
    });
  }, [open, reset]);

  useEffect(() => {
    if (role === 'SUPER_ADMIN') {
      setValue('venueId', null);
    }
  }, [role, setValue]);

  useEffect(() => {
    if (!open || role !== 'VENUE_ADMIN') return;
    const first = venues[0]?.id;
    if (first == null) return;
    const cur = getValues('venueId');
    if (cur == null) setValue('venueId', first);
  }, [open, role, venues, setValue, getValues]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni admin kullanıcı</DialogTitle>
          <DialogDescription>
            Süper yönetici tüm mekanları; mekan yöneticisi yalnızca kendi mekanını yönetir.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(async (values) => {
            const payload: AdminUserCreateInput = {
              name: values.name,
              email: values.email,
              password: values.password,
              role: values.role as Role,
              venueId: values.role === 'SUPER_ADMIN' ? null : values.venueId,
              isActive: values.isActive,
            };
            await onSubmit(payload);
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="adm-name">Ad soyad</Label>
            <Input id="adm-name" {...register('name')} />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adm-email">E-posta</Label>
            <Input id="adm-email" type="email" autoComplete="off" {...register('email')} />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adm-pass">Şifre</Label>
            <Input id="adm-pass" type="password" autoComplete="new-password" {...register('password')} />
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>Rol</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Süper yönetici</SelectItem>
                    <SelectItem value="VENUE_ADMIN">Mekan yöneticisi</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {role === 'VENUE_ADMIN' ? (
            <div className="space-y-1.5">
              <Label>Mekan</Label>
              <Controller
                control={control}
                name="venueId"
                render={({ field }) => (
                  <Select
                    value={field.value != null ? String(field.value) : undefined}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Mekan seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((v) => (
                        <SelectItem key={v.id} value={String(v.id)}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.venueId ? (
                <p className="text-xs text-destructive">
                  {typeof errors.venueId.message === 'string'
                    ? errors.venueId.message
                    : 'Mekan seçin'}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Aktif</p>
              <p className="text-xs text-muted-foreground">Pasif kullanıcılar giriş yapamaz.</p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(v) => setValue('isActive', v)}
              aria-label="Aktif"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Vazgeç
            </Button>
            <Button type="submit" disabled={loading || (role === 'VENUE_ADMIN' && venues.length === 0)}>
              {loading ? 'Oluşturuluyor…' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
