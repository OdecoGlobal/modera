'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({
  path,
  label = 'Go Back',
}: {
  path?: string;
  label?: string;
}) => {
  const router = useRouter();
  const handleRouter = () => {
    if (path) {
      router.push(path);
    } else {
      router.back();
    }
  };
  return (
    <Button onClick={handleRouter} variant="outline" size="lg">
      <ArrowLeft />
      {label}
    </Button>
  );
};

export default BackButton;
