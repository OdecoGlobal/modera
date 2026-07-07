import KycComponent from '@/components/custom/kyc/status';
import { requireUser } from '@/lib/auth-guard';

const KycPage = async () => {
  await requireUser();
  return (
    <>
      <KycComponent />
    </>
  );
};

export default KycPage;
