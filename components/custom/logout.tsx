'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { Logout01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';

const LogoutButton = () => {
  const router = useRouter();
  return (
    <Button
      onClick={async () => {
        await authClient.signOut();

        router.refresh();
      }}
      variant="ghost"
      className="w-full flex-start p-0"
    >
      <HugeiconsIcon icon={Logout01Icon} /> Sign Out
    </Button>
  );
};

export default LogoutButton;
