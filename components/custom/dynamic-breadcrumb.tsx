'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(segment => segment !== '');

  const getHref = (index: number) => {
    return '/' + segments.slice(0, index + 1).join('/');
  };

  const shouldCollapse = segments.length > 3;

  return (
    <Breadcrumb className="hidden lg:block">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {segments.length > 0 && <BreadcrumbSeparator />}

        {shouldCollapse ? (
          <>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="w-4 h-4" />
                  <span className="sr-only">Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {segments.slice(0, -2).map((segment, index) => (
                    <DropdownMenuItem key={index}>
                      <Link href={getHref(index)} className="capitalize">
                        {segment.replace(/-/g, ' ')}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>

            <BreadcrumbSeparator />
            {segments.slice(-2).map((segment, index) => {
              const adjustedIndex = segments.length - 2 + index;
              const isLast = adjustedIndex === segments.length - 1;
              const href = getHref(adjustedIndex);
              const formattedSegment = segment
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

              return (
                <React.Fragment key={adjustedIndex}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{formattedSegment}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href}>
                        {formattedSegment}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </>
        ) : (
          segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            const href = getHref(index);
            const formattedSegment = segment
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');

            return (
              <React.Fragment key={index}>
                <BreadcrumbItem key={index}>
                  {isLast ? (
                    <BreadcrumbPage>{formattedSegment}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>
                      {formattedSegment}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
