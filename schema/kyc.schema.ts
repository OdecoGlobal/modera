import z from 'zod';
import { KycStatusEnum, KycTierEnum } from './enum';

export const UpdateKycSchema = z.object({
  reason: z.string({ error: 'Invalid format' }).optional(),
  tier: KycTierEnum,
});

export const SubmitKycSchema = z.object({
  bvn: z.string().optional(),
  nin: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
});

export const KycSubmission = SubmitKycSchema.extend({
  id: z.string(),
  tier: KycTierEnum,
  rejectionReason: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.date().optional(),
  createdAt: z.date(),
  status: KycStatusEnum,
});
