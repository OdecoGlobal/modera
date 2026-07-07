export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className=" wrapper flex flex-col min-h-svh items-center justify-center">
      {children}
    </main>
  );
}
