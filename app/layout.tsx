import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from '@/constant';
import { Toaster } from 'sonner';
import TanstackProvider from '@/providers/tanstack.provider';
import { TooltipProvider } from '@/components/ui/tooltip';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },

  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TanstackProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster
              richColors
              toastOptions={{
                classNames: {
                  success: 'bg-green-100 text-green-900',
                  error: 'bg-red-100 text-red-900',
                  warning: 'bg-yellow-100 text-yellow-900',
                  info: 'bg-blue-100 text-blue-900',
                  default: 'bg-green-100 text-green-900',
                },
              }}
            />
          </TanstackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
