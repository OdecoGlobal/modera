import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type FormButtonProps = {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  form?: string;
  disabled?: boolean;
};

const FormButton = ({
  isLoading,
  loadingText = 'Please wait...',
  children,
  className,
  form,
  disabled,
}: FormButtonProps) => {
  return (
    <Button
      type="submit"
      form={form}
      disabled={isLoading || disabled}
      className={cn(
        'w-full text-white bg-brand-primary hover:bg-brand-primary/80 transition-colors',
        className,
      )}
    >
      {isLoading ? (
        <>
          <span>{loadingText}</span>
          <Loader2 className="w-4 h-4 animate-spin" />
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default FormButton;
