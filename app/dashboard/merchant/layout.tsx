import AppSidebar from '@/components/custom/sidebar/app-sidebar';
import SidebarShell from '@/components/custom/sidebar/sidebar-shell';
import {
  AccountSetting01Icon,
  DeviceAccessIcon,
  Home01Icon,
  IdVerifiedIcon,
  TransactionHistoryIcon,
} from '@hugeicons/core-free-icons';

const items = [
  {
    title: 'Home',
    href: '/',
    icon: Home01Icon,
  },

  {
    title: 'My History',
    href: '/history',
    icon: TransactionHistoryIcon,
  },

  {
    title: 'Settings',
    href: '/settings',
    icon: AccountSetting01Icon,
    subItems: [
      {
        title: 'Account Setting',
        href: '/settings/account',
        icon: AccountSetting01Icon,
      },
      {
        title: 'Kyc Verification',
        href: '/settings/kyc',
        icon: IdVerifiedIcon,
      },
    ],
  },
  {
    title: 'Developer Setting',
    href: '/api-key',
    icon: DeviceAccessIcon,
  },
];
export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppSidebar items={items} />
      <SidebarShell>{children}</SidebarShell>
    </>
  );
}
