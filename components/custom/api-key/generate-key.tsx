'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useGenerateMyApiKey } from '@/query/use-api-key';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import CopyText from '../copy-text';

const GenerateApiKeyButton = () => {
  const [newKey, setNewKey] = useState<string | null>(null);
  const { mutate, isPending } = useGenerateMyApiKey();

  function handleGenerate() {
    mutate(undefined, {
      onSuccess(data) {
        setNewKey(data.data.key);
      },
    });
  }
  return (
    <>
      <Button
        onClick={handleGenerate}
        disabled={isPending}
        className="min-w-30 bg-brand-primary hover:bg-brand-primary/80 text-white"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          ' Generate New Key'
        )}
      </Button>
      <AlertDialog
        open={!!newKey}
        onOpenChange={o => {
          if (!o) setNewKey(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Your new API key</AlertDialogTitle>
            <AlertDialogDescription>
              API key generated. <b>COPY IT NOW</b> . It will not be shown
              again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {newKey && (
            <code className="block bg-muted rounded p-2 min-w-0">
              <CopyText text={newKey} className="min-w-0 truncate" />
            </code>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewKey(null)}>
              I&apos;ve copied my key
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GenerateApiKeyButton;
