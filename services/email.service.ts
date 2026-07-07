import { FROM_EMAIL } from '@/constant';
import VerifyEmail from '@/emails/verification';
import { resend } from '@/lib/resend';
import { ReactNode } from 'react';

export class EmailService {
  private static async sendEmail({
    to,
    subject,
    component,
  }: {
    to: string;
    subject: string;
    component: ReactNode;
  }) {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      react: component,
      subject,
    });
    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
    return data;
  }

  static async sendVerificationLink({
    to,
    verificationLink,
    firstName,
  }: {
    to: string;
    verificationLink: string;
    firstName: string;
  }) {
    return this.sendEmail({
      to,
      subject: 'Verify your email address',
      component: VerifyEmail({
        userFirstname: firstName,
        verifyEmailLink: verificationLink,
      }),
    });
  }
}
