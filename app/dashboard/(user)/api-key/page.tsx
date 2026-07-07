import ApiKeyComponent from '@/components/custom/api-key';
import GenerateApiKeyButton from '@/components/custom/api-key/generate-key';
import BackButton from '@/components/custom/back-btn';
import { requireUser } from '@/lib/auth-guard';

const DeveloperPage = async () => {
  await requireUser();
  return (
    <section className="space-y-6">
      <BackButton />
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Developer API Key</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Use this key to access the nomba-dva API from your own applications.
          </p>
        </div>

        <GenerateApiKeyButton />
      </header>

      <ApiKeyComponent />
    </section>
  );
};

export default DeveloperPage;
