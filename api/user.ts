import { fetchApi } from '.';

export async function getMyDetails() {
  const res = await fetchApi('/users/me', {
    credentials: 'include',
  });
  return res;
}
