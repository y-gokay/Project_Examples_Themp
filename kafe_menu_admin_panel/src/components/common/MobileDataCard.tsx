import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function fieldLabel(header: React.ReactNode, fallbackKey: string): string {
  if (typeof header === 'string' || typeof header === 'number') return String(header);
  return fallbackKey;
}

export interface MobileDataCardColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
}

interface MobileDataCardProps<T> {
  row: T;
  columns: MobileDataCardColumn<T>[];
  onClick?: () => void;
  className?: string;
}

/** Tablo satırının mobil kart karşılığı */
export function MobileDataCard<T>({ row, columns, onClick, className }: MobileDataCardProps<T>) {
  return (
    <Card
      className={cn('overflow-hidden p-4 shadow-sm', onClick && 'cursor-pointer active:bg-muted/40', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div className="space-y-3">
        {columns.map((col, i) => {
          const value = col.cell(row);
          if (i === 0) {
            return (
              <div key={col.key} className="border-b border-border pb-2 text-base font-semibold leading-snug">
                {value}
              </div>
            );
          }
          return (
            <div key={col.key} className="flex gap-3 text-sm">
              <span className="w-[38%] shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {fieldLabel(col.header, col.key)}
              </span>
              <div className="min-w-0 flex-1 text-end wrap-break-word text-foreground">{value}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
