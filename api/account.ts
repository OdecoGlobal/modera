import {
  AccountNameType,
  MerchantType,
  ReasonType,
  VirtualAccountType,
} from '@/types/account';
import { fetchApi } from '.';
import { ApiResponse } from '@/types';

interface GetMyAccoutType {
  balance: number;
  virtualAccount: VirtualAccountType;
  merchant: MerchantType;
}

export async function getMyAccount() {
  const data = await fetchApi<ApiResponse<GetMyAccoutType>>('/accounts/me', {
    credentials: 'include',
  });
  return data;
}

export async function renameMyAccount({
  ref,
  data,
}: {
  ref: string;
  data: AccountNameType;
}) {
  const res = await fetchApi(`/accounts/${ref}/rename`, {
    credentials: 'include',
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res;
}
export async function closeMyAccount({
  ref,
  data,
}: {
  ref: string;
  data: ReasonType;
}) {
  const res = await fetchApi(`/accounts/${ref}/close`, {
    credentials: 'include',
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res;
}
