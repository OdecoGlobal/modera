import { Button } from '@/components/ui/button';
import Link from 'next/link';

const NotFound = () => {
  return (
    <main className="min-w-0 min-h-svh flex flex-col justify-center items-center w-full wrapper">
      <section className="flex flex-col justify-center items-center gap-4 text-center">
        <h2 className="font-bold text-8xl text-brand-secondary lg:text-9xl">
          404
        </h2>
        <p className="font-semibold font-serif text-xl lg:text-3xl">
          Oops! Why you&apos;re here?
        </p>
        <p className="text-sm max-w-md text-wrap text-muted-foreground">
          We are very sorry for inconvenience. It looks like you&apos;re try to
          access a page that either has been deleted or never existed.
        </p>
        <Button
          asChild
          className="bg-brand-primary text-white hover:bg-brand-primay/75"
        >
          <Link href="/">Back To Home</Link>
        </Button>
      </section>
    </main>
  );
};

export default NotFound;
