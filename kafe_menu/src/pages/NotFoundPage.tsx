import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';

export function NotFoundPage() {
  return (
    <div className="py-12">
      <EmptyState
        icon={FileQuestion}
        title="Sayfa bulunamadı"
        description="Aradığınız adres mevcut değil veya taşınmış olabilir."
        action={
          <Button asChild>
            <Link to="/">Panele dön</Link>
          </Button>
        }
      />
    </div>
  );
}
