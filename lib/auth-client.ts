import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || 'https://virtualstack.odeco.dev',
  plugins: [adminClient()],
});
export type SessionUser = typeof authClient.$Infer.Session.user;
