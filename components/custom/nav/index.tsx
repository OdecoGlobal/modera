import { Button } from '@/components/ui/button';
import Link from 'next/link';
import MobileNav from './mobile-nav';
import { APP_NAME } from '@/constant';
import NavLinks from './nav-link';
import { ModeToggle } from '../mode-toggle';
import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';
import UserMenu from './user-menu';

export default async function Nav() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });
  const user = session.data?.user;
  return (
    <nav className="sticky top-0 z-20 shadow-lg bg-background/80 backdrop-blur-md">
      <div className="wrapper flex-between">
        <div className="lg:hidden">
          <MobileNav />
        </div>
        <div className="flex items-center gap-2">
          {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#FFC005] to-[#ff9500]">
            <span className="text-sm font-bold text-black">V</span>
          </div> */}
          <span className="text-3xl font-bold">{APP_NAME}</span>
        </div>

        <div className="hidden lg:flex lg:justify-between lg:items-center lg:gap-6">
          <NavLinks />
          <Button asChild variant="brand">
            <Link href="/dashboard">Launch Demo</Link>
          </Button>
        </div>
        <div className="gap-4 flex-start">
          <ModeToggle />
          {user && <UserMenu user={user} />}
        </div>
      </div>
    </nav>
  );
}
