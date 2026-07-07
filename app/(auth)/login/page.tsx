import LoginForm from './login-form';

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) => {
  const search = await searchParams;
  return <LoginForm callbackUrl={search.callbackUrl} />;
};

export default LoginPage;
