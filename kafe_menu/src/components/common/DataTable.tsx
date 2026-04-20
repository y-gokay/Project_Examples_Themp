import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MobileDataCard } from '@/components/common/MobileDataCard';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headClassName?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[] | undefined;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string | number;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyState,
  onRowClick,
  rowKey,
}: DataTableProps<T>) {
  const mobileColumns = columns.map((c) => ({
    key: c.key,
    header: c.header,
    cell: c.cell,
  }));

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Mobil: kart listesi */}
      <div className="space-y-3 p-3 md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`m-sk-${i}`} className="space-y-2 rounded-xl border border-border p-4">
              <Skeleton className="h-5 max-w-[200px]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 max-w-[90%]" />
            </div>
          ))
        ) : !data || data.length === 0 ? (
          <div className="py-10 text-center">
            {emptyState ?? (
              <span className="text-sm text-muted-foreground">Kayıt bulunamadı</span>
            )}
          </div>
        ) : (
          data.map((row) => (
            <MobileDataCard
              key={rowKey(row)}
              row={row}
              columns={mobileColumns}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            />
          ))
        )}
      </div>

      {/* Masaüstü: tablo + yatay kaydırma yedek */}
      <div className="hidden md:block md:overflow-x-auto">
        <Table className="min-w-[640px]">
          <TableHeader className="bg-muted/40">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.headClassName}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center">
                  {emptyState ?? (
                    <span className="text-sm text-muted-foreground">Kayıt bulunamadı</span>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
