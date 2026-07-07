import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from 'react-email';
import 'dotenv/config';

interface VerifyEmailProps {
  userFirstname?: string;
  verifyEmailLink?: string;
}

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

const APP_NAME = process.env.APP_NAME || 'Nomba Test';

export const VerifyEmail = ({
  userFirstname,
  verifyEmailLink,
}: VerifyEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-[#f6f9fc] py-2.5 m-0">
          <Preview>Verify your email address for {APP_NAME}</Preview>
          <Container className="bg-white border border-solid border-[#f0f0f0] p-11.25 max-w-150 mx-auto">
            <Img
              src={`${baseUrl}/images/logo.svg`}
              width="36"
              height="36"
              alt={APP_NAME}
              className="mb-6"
            />

            <Heading className="text-[#1d1c1d] text-3xl font-bold m-0 mb-4 leading-tight">
              Verify your email address
            </Heading>

            <Text className="text-base text-[#404040] leading-6.5 mb-2">
              Hi {userFirstname},
            </Text>

            <Text className="text-base text-[#404040] leading-6.5 mb-6">
              Thanks for signing up for {APP_NAME}. Please verify your email
              address by clicking the button below to activate your account.
            </Text>

            <Section className="mb-6">
              <Button
                className="bg-[#007ee6] rounded text-white text-[15px] no-underline text-center font-semibold block w-52.5 py-3.5 px-1.75"
                href={verifyEmailLink}
              >
                Verify email address
              </Button>
            </Section>

            <Section className="bg-[#f5f4f5] rounded p-5 mb-6">
              <Text className="text-sm text-[#666] leading-5.5 m-0 mb-2">
                If the button above isn&apos;t clickable, copy and paste this
                link into your browser:
              </Text>
              <Link
                href={verifyEmailLink}
                className="text-[#007ee6] text-sm break-all underline"
              >
                {verifyEmailLink}
              </Link>
            </Section>

            <Text className="text-sm text-[#404040] leading-5.5 mb-6">
              If you didn&apos;t create an account with {APP_NAME}, you can
              safely ignore this email.
            </Text>

            <Section className="border-t border-solid border-[#f0f0f0] pt-6">
              <Text className="text-xs text-[#b7b7b7] leading-4.5 m-0">
                © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
                <br />
                500 Howard Street, Lagos, LA 3453, Nigeria
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

VerifyEmail.PreviewProps = {
  userFirstname: 'Chidera',
  verifyEmailLink: 'https://carelink.app/verify-email?token=abc123xyz',
} as VerifyEmailProps;

export default VerifyEmail;
