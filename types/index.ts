import { KycStatusEnum, KycTierEnum } from '@/schema/enum';
import z from 'zod';

type Meta = {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};
export type PaginatedResponse<T> = {
  status: string;
  data: T[];
  meta: Meta;
};
export type SingleResponse<T> = {
  status: string;
  data: T;
};

export type ApiResponse<T> = {
  data: T;
  status: string;
  message?: string;
};

export type KycTierType = z.infer<typeof KycTierEnum>;
export type KycStatusType = z.infer<typeof KycStatusEnum>;
