import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ListTree, UtensilsCrossed } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useEffectiveVenueId } from '@/hooks/useEffectiveVenueId';
import { listCategories } from '@/services/categories';
import { listProducts } from '@/services/products';

export function DashboardPage() {
  const venueId = useEffectiveVenueId();

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

  const loading = categoriesQuery.isLoading || productsQuery.isLoading;
  const error = categoriesQuery.isError || productsQuery.isError;

  if (!venueId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Panel"
          description="Özet istatistikler seçili mekana göre listelenir."
        />
        <EmptyState
          title="Mekan seçilmedi"
          description="Üst bardan bir mekan seçin veya süper yönetici olarak mekan oluşturun."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel"
        description="Seçili mekan için kategori ve ürün özetleri."
      />

      {error ? (
        <EmptyState
          title="Veri yüklenemedi"
          description="Bağlantıyı kontrol edip yeniden deneyin."
          action={
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => categoriesQuery.refetch()}>
                Kategorileri yenile
              </Button>
              <Button type="button" onClick={() => productsQuery.refetch()}>
                Ürünleri yenile
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/categories"
            className="group block cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-primary-50/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kategoriler</CardTitle>
                <ListTree className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  <p className="text-3xl font-bold tabular-nums text-foreground">
                    {categoriesQuery.data?.length ?? 0}
                  </p>
                )}
                <p className="text-xs text-muted-foreground group-hover:text-foreground/80">
                  Bu mekandaki kategori sayısı
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link
            to="/products"
            className="group block cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-primary-50/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ürünler</CardTitle>
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  <p className="text-3xl font-bold tabular-nums text-foreground">
                    {productsQuery.data?.length ?? 0}
                  </p>
                )}
                <p className="text-xs text-muted-foreground group-hover:text-foreground/80">
                  Bu mekandaki ürün sayısı
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
