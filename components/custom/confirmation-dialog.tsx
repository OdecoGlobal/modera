'use client';
import React, { useState } from 'react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

import { Button } from '../ui/button';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import { Loading03Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

const ConfirmationDialog = ({
  action,
  disable,
  label = 'Delete',
  isPending,
  className,
  message = "This action can't be undone",
  buttonVariant = 'default',
  title = 'Are you absolutely sure?',
  icon,
  trigger,
}: {
  id?: string;
  action: (onSuccess: () => void) => void;
  disable?: boolean;
  label?: string;
  isPending?: boolean;
  icon?: IconSvgElement;
  className?: string;
  message?: string;
  title?: string;
  trigger?: React.ReactNode;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'secondary';
}) => {
  const [open, setOpen] = useState(false);

  const handleAction = () => {
    action(() => setOpen(false));
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant={buttonVariant} className={cn(className)}>
            {label}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
          <AlertDialogFooter className="bg-transparent border-transparent ml-auto">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant={buttonVariant}
              size="sm"
              disabled={disable ?? isPending}
              onClick={handleAction}
              className={className}
            >
              {isPending ? (
                <HugeiconsIcon icon={Loading03Icon} />
              ) : (
                <>
                  {icon} {label}
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default ConfirmationDialog;
