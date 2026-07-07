import { loginSchema, signUpSchema } from '@/schema/auth.schema';
import z from 'zod';

export type SignUpType = z.infer<typeof signUpSchema>;
export type LoginType = z.infer<typeof loginSchema>;
