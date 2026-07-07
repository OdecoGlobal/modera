'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DEFAULT_PROFILE } from '@/constant';
import { SessionUser } from '@/lib/auth-client';
import {
  DashboardSquare02Icon,
  UserCircle02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import Link from 'next/link';
// import LogoutButton from './logout';
import { Button } from '@/components/ui/button';
import LogoutButton from '../logout';

const UserMenu = ({ user }: { user: SessionUser }) => {
  const image = DEFAULT_PROFILE;
  const email = user.email;
  const name = user.name;
  const firstInitial = name.charAt(0).toUpperCase() ?? 'AV';

  return (
    <nav className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer" asChild>
          <Button variant="ghost" size="icon-lg">
            <Avatar>
              <AvatarImage src={image} alt="user-image" />
              <AvatarFallback>{firstInitial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuItem>
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="w-8 h-8 rounded-lg">
                <AvatarImage src={image} alt={firstInitial} />
                <AvatarFallback className="rounded-lg">
                  {firstInitial}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-medium truncate">{name}</span>
                <span className="text-xs truncate">{email}</span>
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link
                href="/dashboard/merchant"
                className="w-full gap-2 flex-start"
              >
                <HugeiconsIcon icon={UserCircle02Icon} /> My Account
              </Link>
            </DropdownMenuItem>

            {user.role?.toLowerCase() === 'admin' && (
              <DropdownMenuItem>
                <Link href="/admin" className="w-full gap-2 flex-start">
                  <HugeiconsIcon icon={DashboardSquare02Icon} />
                  Admin Dashboard
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <LogoutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default UserMenu;
