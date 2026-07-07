import DashboardComponent from '@/components/custom/dashboard';
import { requireUser } from '@/lib/auth-guard';

export default async function Home() {
  await requireUser();
  return <DashboardComponent />;
}
