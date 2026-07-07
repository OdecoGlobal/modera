'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { loginSchema } from '@/schema/auth.schema';
import { LoginType } from '@/types/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import FormButton from '@/components/custom/form-button';
import { useRouter } from 'next/navigation';
import { APP_NAME } from '@/constant';
import Link from 'next/link';

const LoginForm = ({ callbackUrl }: { callbackUrl?: string }) => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginType) => {
    const { email, password } = values;
    try {
      await authClient.signIn.email(
        {
          email,
          password,
          callbackURL: callbackUrl || '/',
        },

        {
          onSuccess: () => {
            toast.success('Success', {
              description: 'Login successful!',
            });
            router.push(callbackUrl || '/');
          },
          onError: ctx => {
            toast.error('Error', {
              description: ctx.error.message || 'Something went wrong',
            });
          },
        },
      );
    } catch {
      toast.error('Error', {
        description: 'An unexpected error occured',
      });
    }
  };
  return (
    <Card className="w-full max-w-md p-8 mx-auto">
      <CardHeader>
        <CardTitle className="h2-bold text-brand-primary">Sign In</CardTitle>
        <CardDescription>Log into your {APP_NAME} account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email" className="gap-1">
                    Email
                    <span className="text-red-500 align-sup">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    type="email"
                    placeholder="joedoe@example.com"
                    id="email"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password" className="gap-1">
                    Password
                    <span className="text-red-500 align-sup">*</span>
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      aria-invalid={fieldState.invalid}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your  password"
                      id="password"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        variant="ghost"
                        type="button"
                        size="icon-xs"
                        onClick={() => setShowPassword(prev => !prev)}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-end text-brand-primary hover:text-brand-primary/75 hover:underline"
                  >
                    Forgot Password?
                  </Link>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="space-y-1">
              <FormButton
                isLoading={form.formState.isSubmitting}
                loadingText="Logging In..."
              >
                Login
              </FormButton>
              <p className="text-center">
                Don&apos;t have an account yet?{' '}
                <Link
                  href="/signup"
                  className="text-brand-primary hover:text-brand-primary/75 hover:underline"
                >
                  Register Here
                </Link>
              </p>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
