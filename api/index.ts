import { API_URL } from '@/constant';

export async function fetchApi<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, options);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      typeof data?.message === 'string' ? data.message : 'Request Failed',
    );
  }

  return data as T;
}
