'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useSubmitKyc } from '@/query/use-kyc';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import FormButton from '../../form-button';
import { KYC_TIERS } from '@/lib/kyc';
import { formatAmount } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const verifyKYC = z.object({
  nin: z
    .string({ error: 'Invalid NIN format' })
    .min(5, 'NIN must be at least 4 characters long'),
  address: z
    .string({ error: 'Invalid address' })
    .min(5, 'Address must be at least 4 characters long'),
});
type VerifyKycType = z.infer<typeof verifyKYC>;
const KycVerifiedForm = () => {
  const { mutate, isPending } = useSubmitKyc();
  const [open, setOpen] = useState(false);
  const form = useForm<VerifyKycType>({
    resolver: zodResolver(verifyKYC),
    defaultValues: {
      nin: '',
      address: '',
    },
  });

  const onSubmit = async (values: VerifyKycType) => {
    mutate(values, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand-primary hover:bg-brand-primary/75 text-white">
          Update Kyc
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to Basic (Tier 3) </DialogTitle>
          <DialogDescription>
            Tier 3 verification unlocks ₦1,000,000 per transaction
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              control={form.control}
              name="nin"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="flex gap-0.5" htmlFor="nin">
                    NIN
                    <span className="text-red-500 align-super">*</span>
                  </FieldLabel>
                  <Input
                    id="nin"
                    {...field}
                    placeholder="1234567890"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="address"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="flex gap-0.5" htmlFor="address">
                    Address
                    <span className="text-red-500 align-super">*</span>
                  </FieldLabel>
                  <Input
                    id="address"
                    {...field}
                    placeholder="20, lagos street"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <div className="flex items-center justify-end gap-2">
            <Button
              className="p-4"
              onClick={() => {
                form.reset();
                setOpen(false);
              }}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
            <FormButton isLoading={isPending} disabled={isPending}>
              Upgrade to verified
            </FormButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KycVerifiedForm;

export const VerifiedKycComponent = () => {
  const { basic: limits } = KYC_TIERS;
  return (
    <Card>
      <CardHeader>
        <div className="flex-between">
          <CardTitle>
            <p>Current Tier</p>
            <p className="text-sm text-muted-foreground font-medium">Tier 2</p>
          </CardTitle>
          <KycVerifiedForm />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-left mt-4">
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Per transaction</p>
            <p className="font-semibold text-sm mt-1">
              {formatAmount(limits.transactionLimit)}
            </p>
          </div>
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Daily limit</p>
            <p className="font-semibold text-sm mt-1">
              {formatAmount(limits.dailyLimit)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
