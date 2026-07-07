import { ApiResponse } from '@/types';
import { fetchApi } from '.';
import { KycResponse, SubmitKycType } from '@/types/kyc';

export async function getMyKycSubmission() {
  const res = await fetchApi<ApiResponse<KycResponse>>('/kyc/status', {
    credentials: 'include',
    method: 'GET',
  });

  return res;
}

export async function submitKyc(values: SubmitKycType) {
  const res = await fetchApi('/kyc/submit', {
    credentials: 'include',
    method: 'POST',
    body: JSON.stringify(values),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return res;
}
