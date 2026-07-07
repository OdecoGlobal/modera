'use client';

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useRenameMyAccount } from '@/query/use-account';
import { accountNameSchema } from '@/schema/account.schema';
import { AccountNameType, VirtualAccountType } from '@/types/account';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import FormButton from '../form-button';

const RenameAccountForm = ({
  account,
  isClosed,
}: {
  account: VirtualAccountType;
  isClosed: boolean;
}) => {
  const { mutate: rename, isPending: isRenaming } = useRenameMyAccount();

  const form = useForm<AccountNameType>({
    resolver: zodResolver(accountNameSchema),
    defaultValues: {
      accountName: account.bankAccountName,
    },
  });
  const onSubmit = (values: AccountNameType) => {
    rename({ ref: account.accountRef, data: values });
  };
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Controller
          control={form.control}
          name="accountName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="flex gap-0.5" htmlFor="accountName">
                Account Name
                <span className="text-red-500 align-super">*</span>
              </FieldLabel>
              <Input
                id="accountName"
                {...field}
                placeholder="Joe Doe"
                aria-invalid={fieldState.invalid}
                disabled={isClosed}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <FormButton isLoading={isRenaming} disabled={isClosed || isRenaming}>
        RenameAccount
      </FormButton>
    </form>
  );
};

export default RenameAccountForm;
