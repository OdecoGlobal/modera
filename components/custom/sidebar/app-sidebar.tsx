'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { APP_LOGO } from '@/constant';

import Link from 'next/link';
import { ComponentProps, useState } from 'react';
import { cn } from '@/lib/utils';
import SidebarUserMenu from './sidebar-user';
import { ChevronRight } from 'lucide-react';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { usePathname } from 'next/navigation';

export type NavItem = {
  title: string;
  href: string;
  icon?: IconSvgElement;
  subItems?: NavItem[];
};

const AppSidebar = ({
  items,
  ...props
}: { items: NavItem[] } & ComponentProps<typeof Sidebar>) => {
  const pathname = usePathname();
  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href;
  };
  const isParentActive = (item: NavItem) => {
    return (
      item.subItems?.some(sub => sub.href && pathname.startsWith(sub.href)) ??
      false
    );
  };

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    items.reduce(
      (acc, item) => {
        acc[item.title] = isParentActive(item);
        return acc;
      },
      {} as Record<string, boolean>,
    ),
  );

  const toggleItem = (title: string) => {
    setOpen(prev =>
      Object.keys(prev).reduce(
        (acc, key) => {
          acc[key] = key === title ? !prev[title] : false;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    );
  };
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar {...props} collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8">
                <AvatarImage src={APP_LOGO} />
                <AvatarFallback>BL</AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="text-sm font-semibold truncate">
                  VirtualStack
                </span>
                <span className="text-xs truncate text-muted-foreground">
                  Dashboard
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* {isAdmin && (
          <div className="group-data-[collapsible=icon]:hidden">
            <SearchForm />
          </div>
        )} */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map(item =>
              item.subItems ? (
                <Collapsible
                  key={item.title}
                  title={item.title}
                  className="group/collapsible"
                  open={open[item.title] ?? false}
                  onOpenChange={() => toggleItem(item.title)}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isParentActive(item)}>
                        <div className="flex items-center flex-1 gap-2">
                          {item.icon && <HugeiconsIcon icon={item.icon} />}
                          {item.title}
                        </div>

                        <ChevronRight
                          className={cn(
                            'size-4 transition-transform in-data-[state=open]:rotate-90',
                            open[item.title] && 'rotate-90',
                          )}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subItems.map(subItem => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActive(subItem.href)}
                            >
                              <Link
                                href={subItem.href}
                                onClick={() => setOpenMobile(false)}
                              >
                                {subItem.icon && (
                                  <HugeiconsIcon icon={subItem.icon} />
                                )}
                                {subItem.title}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href} onClick={() => setOpenMobile(false)}>
                      {item.icon && <HugeiconsIcon icon={item.icon} />}
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ),
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarUserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
