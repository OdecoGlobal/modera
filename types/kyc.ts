import z from 'zod';
import { KycTierType } from '.';
import { KycSubmission, SubmitKycSchema } from '@/schema/kyc.schema';

export type KycLimits = {
  dailyLimit: number;
  label: string;
  monthlyLimit: number;
  transactionLimit: number;
};
export type KycSubmissionType = z.infer<typeof KycSubmission>;

export type KycResponse = {
  currentTier: KycTierType;
  limits: KycLimits;
  submission?: KycSubmissionType;
};

export type SubmitKycType = z.infer<typeof SubmitKycSchema>;
