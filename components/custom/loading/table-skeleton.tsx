import { Skeleton } from '@/components/ui/skeleton';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  headers?: string[];
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  headers,
}: TableSkeletonProps) {
  return (
    <>
      <TableHeader>
        <TableRow>
          {headers
            ? headers.map(header => (
                <TableHead key={header}>{header}</TableHead>
              ))
            : Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: headers?.length ?? columns }).map(
              (_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ),
            )}
          </TableRow>
        ))}
      </TableBody>
    </>
  );
}
