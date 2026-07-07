import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins/admin';
import { prisma } from './prisma';
import { EmailService } from '@/services/email.service';
import { createAuthMiddleware } from 'better-auth/api';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: ['http://localhost:3000', 'https://virtualstack.odeco.dev'],
  baseUrl: process.env.BETTER_AUTH_URL || 'https://virtualstack.odeco.dev',
  session: {
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await EmailService.sendVerificationLink({
        to: user.email,
        verificationLink: url,
        firstName: user.name.split(' ')[0],
      });
    },
  },
  plugins: [admin()],

  hooks: {
    after: createAuthMiddleware(async ctx => {
      if (ctx.path.startsWith('/sign-up')) {
        const user = ctx.context.newSession?.user;
        if (!user) return;
        try {
          const merchant = await prisma.merchant.create({
            data: {
              userId: user.id,
              businessName: user.name,
              businessEmail: user.email,
            },
          });
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/provision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              merchantId: merchant.id,
              customerId: null,
              accountName: user.name,
              type: 'merchant',
            }),
          });
        } catch (error) {
          console.error('VA provisioning failed:', error);
        }
      }
    }),
  },
});
