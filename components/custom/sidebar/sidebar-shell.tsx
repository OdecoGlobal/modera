'use client';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ReactNode } from 'react';
import { ModeToggle } from '../mode-toggle';
import { DynamicBreadcrumb } from '../dynamic-breadcrumb';

const SidebarShell = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarInset className="min-w-0">
      <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4  pr-7 z-20 ">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2" />
        <DynamicBreadcrumb />
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </header>

      <main className="mx-auto wrapper">{children}</main>
    </SidebarInset>
  );
};

export default SidebarShell;
