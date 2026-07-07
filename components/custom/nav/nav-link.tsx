'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Features',
    href: '/#features',
  },
  {
    title: 'Docs',
    href: '/docs',
  },
];

const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname();
  return (
    <>
      {navLinks.map(link => {
        const isActive = pathname === link.href;
        return (
          <Link
            href={link.href}
            key={link.title}
            className={cn(
              'font-medium text-lg transition-colors hover:text-brand-secondary-100 capitalize',
              isActive && 'text-brand-secondary-200 font-semibold',
            )}
            onClick={onNavigate}
          >
            {link.title}
          </Link>
        );
      })}
    </>
  );
};

export default NavLinks;
