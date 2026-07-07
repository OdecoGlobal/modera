import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ArrowRight,
  Code,
  Shield,
  Zap,
  Globe,
  Building2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Building2,
    title: 'Virtual Accounts',
    description:
      'Generate dedicated account numbers for each customer. Instant provisioning with real-time webhooks.',
  },
  {
    icon: Shield,
    title: 'Built-in Compliance',
    description:
      'KYC verification, tier management, renames and closure changes. All of which helps regulatory reporting.',
  },
  {
    icon: Zap,
    title: 'Instant Settlements',
    description:
      'Real-time balance updates and instant fund availability. You also get reconciliation accuracy, and identity/naming model quality.',
  },
  {
    icon: Globe,
    title: 'Global reporting',
    description:
      'Customer-level statement and reporting. Handling of misdirected payments, and clean developer API for downstream integration.',
  },
];

const apis = [
  // {
  //   name: 'Health',
  //   url: 'https://backend-production-b387.up.railway.app/api/v1/virtualstack-nomba-docs/#/System/getHealth',
  //   endpoint: 'GET /api/v1/health',
  //   description: 'Check the health of the API',
  // },
  {
    name: 'Create Customer Virtual Account',
    url: '/docs/#/Customers/createCustomer',
    endpoint: 'POST /api/v1/customers',
    description: 'Create customer virtual account',
  },
  {
    name: 'Get a Customer Virtual Account',
    url: '/docs/#/Customers/getCustomerById',
    endpoint: 'GET /api/v1/customers/{id}',
    description: 'Retrieve a customer virtual account',
  },
  {
    name: 'Get Customer Transactions',
    url: '/docs/#/Customers/getCustomerTransactions',
    endpoint: 'GET /api/v1/customer/{id}/transactions',
    description: 'Receive real-time event notifications',
  },
];

export default function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden px-6 pb-20 pt-32">
        <div className="glow-top absolute inset-0" />
        <div className="relative mx-auto max-w-4xl text-center">
          {/* <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />
            <span className="text-sm text-white/70">
              Banking-grade infrastructure
            </span>
          </div> */}
          <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight">
            Virtual Banking Accounts
            <span className="gradient-text-brand block">as a Service</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Virtual accounts, payments, KYC, and compliance — all through one
            unified API. Launch your fintech product in days, not months.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/dashboard/merchant" className="btn-pill-primary">
              View Live Demo
              <ArrowRight size={16} />
            </Link>
            <Link href="/docs/" className="btn-pill-secondary">
              Read the Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Everything you need to build
            </h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              A complete dedicated virtual account stack that scales with you,
              from MVP to millions of users.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map(feature => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                    <feature.icon size={24} />
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="mb-2 text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="docs" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#3C82F6]/20 bg-[#3C82F6]/10 px-3 py-1.5 text-sm font-medium text-[#3C82F6]">
              <Code size={16} />
              <span>Developer First</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold">Simple, powerful APIs</h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              RESTful endpoints that do exactly what you expect. Clear
              responses, exhaustive documentation.
            </p>
          </div>
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {apis.map(api => (
              <a
                key={api.endpoint}
                href={api.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card group flex items-center justify-between rounded-full p-5 text-card-foreground no-underline transition-all hover:border-brand-primary/30 hover:bg-card/50 hover:shadow-lg"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                    <span className="font-mono text-[10px] font-bold text-brand-primary">
                      {api.endpoint.split(' ')[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-mono text-sm font-semibold">
                      {api.endpoint}
                    </div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {api.description}
                    </div>
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className="text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-brand-primary"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 text-center px-12 py-16">
            <div className="glow-center absolute inset-0" />
            <div className="relative">
              <h2 className="mb-4 text-4xl font-bold">Ready to build?</h2>
              <p className="mx-auto mb-8 max-w-lg text-muted-foreground text-base">
                Explore the interactive demo to see how Nomba handles every step
                of the banking flow.
              </p>
              <Link href="/dashboard/merchant" className="btn-pill-primary">
                Launch Interactive Demo
                <ExternalLink size={16} />
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
