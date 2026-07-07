import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="border-t  px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-linear-to-br from-[#FFC005] to-[#ff9500]">
            <span className="text-xs font-bold text-black">V</span>
          </div>
          <span className="text-sm ">VirtualStack</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a
            href="#features"
            className="transition-colors hover:text-muted-foreground/75"
          >
            Features
          </a>
          <Link
            href="/docs/"
            className="transition-colors hover:text-muted-foreground/75"
          >
            Docs
          </Link>
          <Link
            href="/dashboard/merchant"
            className="transition-colors hover:text-muted-foreground/75"
          >
            Demo
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          Virtual Banking Accounts as a Service
        </div>
      </div>
    </footer>
  );
};

export default Footer;
