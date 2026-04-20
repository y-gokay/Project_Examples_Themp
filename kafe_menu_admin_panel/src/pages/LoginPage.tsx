import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { extractErrorMessage } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(3, "Şifre çok kısa"),
});

type LoginForm = z.infer<typeof schema>;

const ATTRIBUTION =
  "Atakum Belediyesi Bilgi İşlem Müdürlüğü tarafından yapılmıştır";

export function LoginPage() {
  const navigate = useNavigate();
  const token = useAppStore((s) => s.token);
  const login = useAppStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (token) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (values: LoginForm) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      const name = useAppStore.getState().user?.name ?? "";
      toast.success(name ? `Hoş geldin, ${name}` : "Giriş başarılı");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Giriş başarısız oldu."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-background to-background p-6">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <Card className="border-border/60 shadow-2xl">
          <CardContent className="p-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <img
                src="/assets/belediyelogo.webp"
                alt="Atakum Belediyesi"
                className="mb-4 h-auto max-h-[72px] w-auto max-w-[220px] object-contain object-center"
                width={220}
                height={72}
                decoding="async"
              />
              <h1 className="text-xl font-bold text-foreground">
                Atakum Belediyesi QR Menü
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Yönetim panelinize giriş yapın
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                />
                {errors.password ? (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Giriş
                    yapılıyor…
                  </>
                ) : (
                  "Giriş yap"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-2 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Atakum Belediyesi · QR Menü</p>
          <p className="text-[11px] leading-relaxed text-muted-foreground/90">
            {ATTRIBUTION}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
