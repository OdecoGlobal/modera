import {
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface EmptyTableProps {
  message?: string;
  colSpan?: number;
  className?: string;
  // rows?: number;
  // columns?: number;
  headers?: string[];
}

export function EmptyTable({
  message = 'No data found',
  colSpan = 1,
  className,
  headers,
}: EmptyTableProps) {
  return (
    <>
      <TableHeader>
        <TableRow>
          {headers?.map(h => (
            <TableHead key={h}>{h}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={headers?.length ?? colSpan}
            className={cn('h-24 text-center text-muted-foreground', className)}
          >
            {message}
          </TableCell>
        </TableRow>
      </TableBody>
    </>
  );
}
