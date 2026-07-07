'use client';
import { cn } from '@/lib/utils';
import { Copy01Icon, CopyCheckIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';

const CopyText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  return (
    <div
      className="flex items-center space-x-2 cursor-pointer"
      onClick={handleCopy}
    >
      <span className={cn('text-sm flex-1', className)}>{text}</span>
      {copied ? (
        <HugeiconsIcon
          icon={CopyCheckIcon}
          className="text-green-500 w-4 h-4 shrink-0"
        />
      ) : (
        <HugeiconsIcon icon={Copy01Icon} className="w-4 h-4 shrink-0" />
      )}
    </div>
  );
};

export default CopyText;
