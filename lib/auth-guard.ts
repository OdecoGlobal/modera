// import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './auth';

export const getSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};

export const requireUser = async () => {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }
  return session;
};

export const requireAdmin = async () => {
  const { user } = await requireUser();
  if (user.role?.toLowerCase() !== 'admin') {
    redirect('/unauthorized');
  }
  return user;
};
