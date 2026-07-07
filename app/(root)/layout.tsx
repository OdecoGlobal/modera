import Footer from '@/components/custom/footer';
import Nav from '@/components/custom/nav';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-svh">
      <Nav />
      <main className="flex-1 pb-20">{children}</main>
      <Footer />
    </div>
  );
}
