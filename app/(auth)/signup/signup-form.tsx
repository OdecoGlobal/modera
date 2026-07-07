'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { signUpSchema } from '@/schema/auth.schema';
import { SignUpType } from '@/types/auth';
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
import Link from 'next/link';

const SignupForm = ({ callbackUrl }: { callbackUrl?: string }) => {
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const router = useRouter();

  const form = useForm<SignUpType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SignUpType) => {
    const { name, email, password } = values;
    try {
      await authClient.signUp.email(
        {
          name,
          email,
          password,
          callbackURL: callbackUrl || '/',
        },

        {
          onSuccess: () => {
            toast.success('Success', {
              description: 'Registration successful!',
            });
            router.replace(callbackUrl || '/dashboard/merchant');
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
        <CardTitle className="h2-bold text-brand-secondary">
          Create Account
        </CardTitle>
        <CardDescription>
          Open a Nomba account to start building your next big idea. It&apos;s
          free to get
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name" className="gap-1">
                    Name
                    <span className="text-red-500 align-sup">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Jon Doe"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

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
                      type={showPassword.password ? 'text' : 'password'}
                      placeholder="Enter your  password"
                      id="password"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        variant="ghost"
                        type="button"
                        size="icon-xs"
                        onClick={() =>
                          setShowPassword(prev => ({
                            ...prev,
                            password: !prev.password,
                          }))
                        }
                      >
                        {showPassword.password ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword" className="gap-1">
                    Confirm Password
                    <span className="text-red-500 align-sup">*</span>
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      aria-invalid={fieldState.invalid}
                      type={showPassword.confirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your  password"
                      id="confirmPassword"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        variant="ghost"
                        type="button"
                        size="icon-xs"
                        onClick={() =>
                          setShowPassword(prev => ({
                            ...prev,
                            confirmPassword: !prev.confirmPassword,
                          }))
                        }
                      >
                        {showPassword.confirmPassword ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div>
              <FormButton
                isLoading={form.formState.isSubmitting}
                // form="register-form"
                loadingText="Registering..."
              >
                Register
              </FormButton>
              <p className="text-center">
                Already have an account yet{' '}
                <Link
                  href="/login"
                  className="text-brand-primary hover:text-brand-primary/75 hover:underline"
                >
                  Login Here
                </Link>
              </p>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
