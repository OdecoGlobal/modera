import { ApiResponse } from '@/types';
import { fetchApi } from '.';

interface MyApiKey {
  prefix: string;
  createdAt: string;
}

export async function getMyApiKey() {
  const res = await fetchApi<ApiResponse<MyApiKey>>('/key/me', {
    credentials: 'include',
  });
  return res;
}

interface NewApiKey {
  key: string;
  message: string;
}

export async function generateMyApiKey() {
  const res = await fetchApi<ApiResponse<NewApiKey>>('/key/generate', {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res;
}
export async function revokeMyApiKey() {
  const res = await fetchApi('/key/revoke', {
    credentials: 'include',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res;
}
