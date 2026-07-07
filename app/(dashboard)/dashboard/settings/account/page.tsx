import AccountSettingComponent from '@/components/custom/account/account-component';
import { requireUser } from '@/lib/auth-guard';

const AccountSettingPage = async () => {
  await requireUser();
  return <AccountSettingComponent />;
};

export default AccountSettingPage;
