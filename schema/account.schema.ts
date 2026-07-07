import z from 'zod';

export const accountNameSchema = z.object({
  accountName: z
    .string({ error: 'Account name is required' })
    .min(2, 'Account name is required'),
});
export const reasonSchema = z.object({
  reason: z
    .string({ error: 'Invalid reason ' })
    .min(2, 'Account name is required')
    .optional(),
});
export const insertAccountSchema = z.object({
  userId: z
    .string({ error: 'User Id is required' })
    .min(1, 'User Id is required'),
  accountName: z
    .string({ error: 'Account name is required' })
    .min(1, 'Account name is required'),
});
