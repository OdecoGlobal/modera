## Token Caching

Tokens are valid for 60 minutes. Cache in memory or Redis and refresh at the 55-minute mark — do not request a fresh token per call

# nomba-dva

> **The infrastructure layer Nigerian fintech forgot to build** — a persistent, identity-bound dedicated virtual account system where every customer gets their own NUBAN-like account number, payments reconcile automatically, and the entire engine is exposed as a clean developer API.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://nomba-dva.vercel.app)
[![Built with Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![Powered by Nomba](https://img.shields.io/badge/Powered%20by-Nomba-0066f6)](https://nomba.com)

**Live Demo:** `https://nomba-dva.vercel.app` ← replace with real URL  
**GitHub:** `https://github.com/your-username/nomba-dva` ← replace with real URL

---

## What It Does

nomba-dva gives every registered user a **dedicated Nigerian virtual bank account number** (powered by Nomba). When anyone sends money to that account number from any Nigerian bank, the system automatically reconciles the payment, enforces KYC-based transaction limits, and updates the user's balance in real time — all via Nomba webhooks.

Built as a reusable infrastructure primitive: other developers can integrate nomba-dva into their own products using the Developer API with an API key — no session, no UI required.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     nomba-dva                           │
│                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  Next.js │    │   Prisma +   │    │   Nomba API   │  │
│  │ App Router│◄──►│  PostgreSQL  │◄──►│  (Sandbox /   │  │
│  │  (UI +   │    │              │    │  Production)  │  │
│  │   API)   │    └──────────────┘    └───────────────┘  │
│  └──────────┘                                           │
│       ▲                                                 │
│       │ webhooks                                        │
│  ┌────┴─────┐                                           │
│  │  Nomba   │  fires on every inbound transfer          │
│  │ Webhook  │                                           │
│  └──────────┘                                           │
└─────────────────────────────────────────────────────────┘
```

**Request flow:**

```
User registers
    → Backend calls Nomba POST /v1/accounts/virtual
    → Nomba returns account number
    → Saved to DB (userId ↔ accountNumber)
    → User sees their dedicated account number

Anyone sends bank transfer to that number
    → Nomba fires webhook to /api/webhooks/nomba
    → System verifies HMAC signature
    → Checks for duplicate (requestId unique index)
    → Validates VA status (active / suspended / closed)
    → Enforces KYC tier limits
    → Records transaction with running balance
    → User balance updates
```

---

## Tech Stack

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Framework  | Next.js 15 (App Router)      |
| Database   | PostgreSQL                   |
| ORM        | Prisma                       |
| Auth       | Better Auth (email/password) |
| Payments   | Nomba Virtual Accounts API   |
| Deployment | Vercel                       |
| UI         | Tailwind CSS + shadcn/ui     |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Nomba account (for API credentials)

### Installation

```bash
git clone https://github.com/your-username/nomba-dva
cd nomba-dva
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nomba_dva?sslmode=disable"

# Better Auth
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3000"

# Nomba API
NOMBA_BASE_URL="https://sandbox.nomba.com"     # or https://api.nomba.com for production
NOMBA_ACCOUNT_ID=""                             # from Nomba dashboard
NOMBA_CLIENT_ID=""                              # sandbox client ID
NOMBA_CLIENT_SECRET=""                          # sandbox client secret
NOMBA_WEBHOOK_SECRET=""                         # from Nomba dashboard webhook settings

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

### Run

```bash
npm run dev
```

### Webhook Testing (Local)

Install ngrok and expose your local server:

```bash
ngrok http 3000
```

Register `https://your-ngrok-url.ngrok.io/api/webhooks/nomba` as your webhook URL in the Nomba dashboard.

Simulate a payment manually:

```bash
curl -X POST http://localhost:3000/api/webhooks/nomba \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "virtual_account.funded",
    "requestId": "test-001",
    "data": {
      "merchant": { "userId": "merchant-id", "walletId": "wallet-id" },
      "virtualAccount": { "aliasAccountReference": "YOUR_ACCOUNT_REF" },
      "transaction": {
        "transactionId": "txn-test-001",
        "transactionAmount": 5000,
        "type": "vact_transfer",
        "time": "2026-06-01T10:00:00Z",
        "responseCode": ""
      },
      "customer": {
        "senderName": "John Doe",
        "bankName": "Access Bank",
        "accountNumber": "0123456789"
      }
    }
  }'
```

---

## Internal API Reference

All internal routes use **Better Auth session cookies**. Authentication is handled automatically when using the frontend.

### Auth

| Method | Endpoint                  | Description                                    |
| ------ | ------------------------- | ---------------------------------------------- |
| POST   | `/api/auth/sign-up/email` | Register a new user — triggers VA provisioning |
| POST   | `/api/auth/sign-in/email` | Sign in                                        |
| POST   | `/api/auth/sign-out`      | Sign out                                       |

### Account

| Method | Endpoint                    | Description                                         |
| ------ | --------------------------- | --------------------------------------------------- |
| GET    | `/api/account/me`           | Get current user's virtual account + balance        |
| GET    | `/api/account/transactions` | Paginated transaction history                       |
| GET    | `/api/account/statement`    | Account statement with date range + running balance |
| PATCH  | `/api/accounts/:ref/rename` | Rename virtual account                              |
| DELETE | `/api/accounts/:ref/close`  | Close virtual account                               |

**Statement query params:**

```
from    ISO date string (defaults to start of current month)
to      ISO date string (defaults to now)
```

**Transactions query params:**

```
page    Page number (default: 1)
limit   Items per page (default: 10)
```

### KYC

| Method | Endpoint          | Description                                      |
| ------ | ----------------- | ------------------------------------------------ |
| POST   | `/api/kyc/submit` | Submit KYC details for tier upgrade              |
| GET    | `/api/kyc/status` | Get current tier, limits, and submission history |

### API Keys

| Method | Endpoint             | Description                             |
| ------ | -------------------- | --------------------------------------- |
| POST   | `/api/keys/generate` | Generate a developer API key            |
| GET    | `/api/keys/me`       | Check if key exists (shows prefix only) |
| DELETE | `/api/keys/revoke`   | Revoke current API key                  |

### Admin

| Method | Endpoint                             | Description                    |
| ------ | ------------------------------------ | ------------------------------ |
| GET    | `/api/admin/users`                   | All users + VA statuses        |
| GET    | `/api/admin/stats`                   | Platform stats                 |
| GET    | `/api/admin/webhook-logs`            | Raw webhook event log          |
| GET    | `/api/admin/kyc`                     | Pending KYC submissions        |
| PATCH  | `/api/admin/kyc/:id/approve`         | Approve KYC submission         |
| PATCH  | `/api/admin/kyc/:id/reject`          | Reject KYC submission          |
| PATCH  | `/api/admin/accounts/:ref/suspend`   | Suspend a virtual account      |
| PATCH  | `/api/admin/accounts/:ref/unsuspend` | Reactivate a suspended account |
| PATCH  | `/api/admin/users/:id/kyc`           | Manually set a user's KYC tier |

### Webhooks

| Method | Endpoint              | Description                                 |
| ------ | --------------------- | ------------------------------------------- |
| POST   | `/api/webhooks/nomba` | Nomba webhook receiver (not for direct use) |

---

## Developer API Reference

The Developer API uses **API key authentication** — no session required. Suitable for server-to-server integration.

### Authentication

Include your API key in every request header:

```
x-api-key: nva_your_api_key_here
```

Generate a key from the dashboard or via `POST /api/keys/generate` (requires session).

> API keys are prefixed with `nva_` for easy identification in logs.  
> Keys are shown **once** at generation — store them securely.

---

### Base URL

```
https://nomba-dva.vercel.app/api/v1
```

---

### Endpoints

#### Provision a Virtual Account

```
POST /api/v1/accounts
```

Creates a dedicated virtual account for the authenticated API key owner.

**Request:** No body required — account is created for the key owner.

**Response:**

```json
{
  "data": {
    "id": "cuid",
    "bankAccountNumber": "0519785355",
    "bankAccountName": "John Doe",
    "bankName": "Nombank MFB",
    "accountRef": "uuid",
    "status": "active",
    "createdAt": "2026-06-01T10:00:00Z"
  }
}
```

**Errors:**

```json
{ "error": "Virtual account already exists for this user" }   // 400
{ "error": "Invalid API key" }                                 // 401
```

---

#### Get Account

```
GET /api/v1/accounts/:ref
```

Retrieve a virtual account by its `accountRef`.

**Response:**

```json
{
  "data": {
    "bankAccountNumber": "0519785355",
    "bankAccountName": "John Doe",
    "bankName": "Nombank MFB",
    "status": "active",
    "balance": 45000,
    "createdAt": "2026-06-01T10:00:00Z"
  }
}
```

---

#### List Transactions

```
GET /api/v1/accounts/:ref/transactions
```

**Query params:**

| Param | Type   | Default | Description              |
| ----- | ------ | ------- | ------------------------ |
| page  | number | 1       | Page number              |
| limit | number | 10      | Items per page (max 100) |

**Response:**

```json
{
  "data": [
    {
      "id": "cuid",
      "amount": 5000,
      "currency": "NGN",
      "reference": "txn-ref",
      "payerName": "Jane Doe",
      "payerBank": "GTBank",
      "status": "success",
      "notes": null,
      "createdAt": "2026-06-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Transaction statuses:**

| Status        | Meaning                                         |
| ------------- | ----------------------------------------------- |
| `success`     | Payment received and credited                   |
| `misdirected` | Payment received on closed or suspended account |
| `flagged`     | Payment exceeds KYC tier limits                 |

---

#### Get Account Statement

```
GET /api/v1/accounts/:ref/statement
```

**Query params:**

| Param | Type     | Default                | Description |
| ----- | -------- | ---------------------- | ----------- |
| from  | ISO date | Start of current month | Range start |
| to    | ISO date | Now                    | Range end   |

**Response:**

```json
{
  "data": {
    "account": {
      "bankAccountNumber": "0519785355",
      "bankAccountName": "John Doe",
      "bankName": "Nombank MFB"
    },
    "period": {
      "from": "2026-06-01T00:00:00Z",
      "to": "2026-06-30T23:59:59Z"
    },
    "summary": {
      "openingBalance": 15000,
      "closingBalance": 45000,
      "totalCredited": 30000,
      "totalTransactions": 8,
      "successfulTransactions": 6,
      "misdirectedTransactions": 1,
      "flaggedTransactions": 1
    },
    "transactions": [
      {
        "id": "cuid",
        "amount": 5000,
        "status": "success",
        "runningBalance": 20000,
        "payerName": "Jane Doe",
        "payerBank": "GTBank",
        "createdAt": "2026-06-10T14:22:00Z"
      }
    ]
  }
}
```

---

### Error Format

All errors follow a consistent shape:

```json
{
  "error": "Human-readable error message"
}
```

| Status | Meaning                                      |
| ------ | -------------------------------------------- |
| 400    | Bad request — invalid input                  |
| 401    | Invalid or missing API key                   |
| 403    | Forbidden — resource belongs to another user |
| 404    | Resource not found                           |
| 500    | Internal server error                        |

---

### Rate Limiting

API key routes are rate-limited to **100 requests per 10 seconds** per key. Exceeding this returns:

```json
{ "error": "Too many requests" } // 429
```

---

## KYC Tier System

Every user starts at `unverified`. Upgrading requires submitting KYC details via the dashboard.

| Tier         | Transaction Limit | Daily Limit | Monthly Limit |
| ------------ | ----------------- | ----------- | ------------- |
| `unverified` | ₦10,000           | ₦50,000     | ₦100,000      |
| `basic`      | ₦50,000           | ₦200,000    | ₦1,000,000    |
| `verified`   | ₦1,000,000        | ₦5,000,000  | ₦50,000,000   |

**Upgrade path:**

```
unverified → basic      requires: BVN + date of birth
basic → verified        requires: BVN + NIN + address
```

Payments that exceed tier limits are recorded as `flagged` — not lost, not rejected. Admins can review and resolve flagged transactions.

---

## Edge Cases Handled

| Scenario                       | Behaviour                                             |
| ------------------------------ | ----------------------------------------------------- |
| Payment to closed account      | Recorded as `misdirected`, audit logged               |
| Payment to suspended account   | Recorded as `misdirected`, audit logged               |
| Payment exceeds KYC limit      | Recorded as `flagged` with reason                     |
| Duplicate webhook delivery     | Detected via `requestId` unique index, ignored safely |
| Unknown webhook event type     | Logged as `ignored`, returns 200                      |
| Nomba API down at registration | Error surfaced, user created, VA can be retried       |

---

## Webhook Security

Nomba signs every webhook with HMAC-SHA256. The system verifies every signature before processing:

```
hashingPayload = event_type:requestId:userId:walletId:transactionId:type:time:responseCode:timestamp
signature = base64(HMAC-SHA256(hashingPayload, NOMBA_WEBHOOK_SECRET))
```

Invalid signatures return `401`. The raw payload is always logged before verification so no event is ever lost.

---

## Production Readiness Notes

The following are stubbed with `TODO` comments and require real Nomba credentials to activate:

- **Token authentication** — `getNombaToken()` is implemented and cached at 55 minutes. Uncomment the `Authorization` header in each Nomba API call.
- **Account rename sync** — updating the name on Nomba's side via `PATCH /v1/accounts/virtual/:number`
- **Account suspension sync** — calling Nomba to freeze the account on their side
- **Account closure sync** — calling Nomba to close the account on their side

Everything else — provisioning, webhook handling, reconciliation, KYC, developer API — is fully functional in sandbox.

---

## Author

Built for the **Nomba Hackathon** hosted by DevCareer — Dedicated Virtual Accounts Infrastructure Track.
