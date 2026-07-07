'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import NavLinks from './nav-link';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const closeSheet = () => setOpen(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden">
        <HugeiconsIcon icon={Menu01Icon} />
      </SheetTrigger>
      <SheetContent className="lg:hidden" side="left">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu Bar</SheetTitle>
          <SheetDescription className="sr-only">Mobile Menu</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col items-center gap-4 px-4 mt-20">
          <NavLinks onNavigate={closeSheet} />
          <Button asChild variant="brand">
            <Link href="/dashboard">Launch Demo</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
