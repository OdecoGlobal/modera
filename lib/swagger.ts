import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VirtualStack API',
      version: '2.0.0',
      description:
        'B2B infrastructure platform — merchants integrate via API key to provision dedicated virtual accounts for their customers, powered by Nomba.',
      contact: {
        name: 'VirtualStack',
        url: 'https://modera.odeco.dev',
      },
    },
    servers: [
      { url: 'https://modera.odeco.dev', description: 'Production' },
      { url: 'http://localhost:3000', description: 'Local development' },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key prefixed with nva_ — generate from dashboard',
        },
        SessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'better-auth.session_token',
          description: 'Session cookie from Better Auth — for dashboard routes',
        },
      },
      schemas: {
        Merchant: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            businessName: { type: 'string', example: 'Acme Fintech Ltd' },
            businessEmail: { type: 'string', example: 'hello@acme.com' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'John Doe' },
            email: {
              type: 'string',
              example: 'john@example.com',
              nullable: true,
            },
            phone: { type: 'string', nullable: true },
            kycTier: {
              type: 'string',
              enum: ['unverified', 'basic', 'verified'],
              example: 'unverified',
            },
            virtualAccount: { $ref: '#/components/schemas/VirtualAccount' },
            balance: { type: 'number', example: 45000 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        VirtualAccount: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            bankAccountNumber: { type: 'string', example: '0519785355' },
            bankAccountName: { type: 'string', example: 'John Doe' },
            bankName: { type: 'string', example: 'Nombank MFB' },
            accountRef: { type: 'string' },
            type: { type: 'string', enum: ['merchant', 'customer'] },
            status: { type: 'string', enum: ['active', 'suspended', 'closed'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            amount: { type: 'number', example: 5000 },
            currency: { type: 'string', example: 'NGN' },
            reference: { type: 'string' },
            payerName: { type: 'string', nullable: true },
            payerBank: { type: 'string', nullable: true },
            narration: { type: 'string', nullable: true },
            status: {
              type: 'string',
              enum: ['success', 'misdirected', 'flagged'],
            },
            notes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Statement: {
          type: 'object',
          properties: {
            account: { $ref: '#/components/schemas/VirtualAccount' },
            period: {
              type: 'object',
              properties: {
                from: { type: 'string', format: 'date-time' },
                to: { type: 'string', format: 'date-time' },
              },
            },
            summary: {
              type: 'object',
              properties: {
                openingBalance: { type: 'number' },
                closingBalance: { type: 'number' },
                totalCredited: { type: 'number' },
                totalTransactions: { type: 'number' },
                successfulTransactions: { type: 'number' },
                misdirectedTransactions: { type: 'number' },
                flaggedTransactions: { type: 'number' },
              },
            },
            transactions: {
              type: 'array',
              items: { $ref: '#/components/schemas/Transaction' },
            },
          },
        },
        KycStatus: {
          type: 'object',
          properties: {
            currentTier: {
              type: 'string',
              enum: ['unverified', 'basic', 'verified'],
            },
            limits: {
              type: 'object',
              properties: {
                transactionLimit: { type: 'number', example: 10000 },
                dailyLimit: { type: 'number', example: 50000 },
                monthlyLimit: { type: 'number', example: 100000 },
              },
            },
            submission: {
              nullable: true,
              type: 'object',
              properties: {
                id: { type: 'string' },
                tier: { type: 'string' },
                status: {
                  type: 'string',
                  enum: ['pending', 'approved', 'rejected'],
                },
                rejectionReason: { type: 'string', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Invalid API key' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
    tags: [
      {
        name: 'Customers',
        description: 'Customer and virtual account management',
      },
      {
        name: 'Transactions',
        description: 'Transaction history and statements',
      },
      { name: 'KYC', description: 'KYC submission and status' },
      { name: 'Keys', description: 'API key management' },
      { name: 'Merchant', description: 'Merchant profile and dashboard' },
      { name: 'Admin', description: 'Platform admin operations' },
    ],
    paths: {
      // ── Customers ──────────────────────────────────────────────────
      '/api/v1/customers': {
        post: {
          tags: ['Customers'],
          summary: 'Create a customer',
          description:
            'Creates a customer and immediately provisions a dedicated virtual account for them',
          security: [{ ApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john@example.com' },
                    phone: { type: 'string', example: '+2348012345678' },
                    metadata: {
                      type: 'object',
                      description: 'Any additional data you want to store',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Customer created with virtual account',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Customer' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error or duplicate email' },
            401: { description: 'Invalid API key' },
          },
        },
        get: {
          tags: ['Customers'],
          summary: 'List customers',
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20 },
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search by name or email',
            },
          ],
          responses: {
            200: {
              description: 'Paginated list of customers',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Customer' },
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
          },
        },
      },

      '/api/v1/customers/{id}': {
        get: {
          tags: ['Customers'],
          summary: 'Get a customer',
          description:
            'Returns customer details, virtual account, and computed balance',
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Customer details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Customer' },
                    },
                  },
                },
              },
            },
            404: { description: 'Customer not found' },
          },
        },
        patch: {
          tags: ['Customers'],
          summary: 'Update a customer',
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    metadata: { type: 'object' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Customer updated' },
          },
        },
      },

      // ── Customer Transactions ───────────────────────────────────────
      '/api/v1/customers/{id}/transactions': {
        get: {
          tags: ['Transactions'],
          summary: 'List customer transactions',
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20 },
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['success', 'misdirected', 'flagged'],
              },
            },
          ],
          responses: {
            200: {
              description: 'Paginated transactions',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Transaction' },
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
          },
        },
      },

      '/api/v1/customers/{id}/statement': {
        get: {
          tags: ['Transactions'],
          summary: 'Get customer statement',
          description:
            'Account statement with opening balance, closing balance, and running balance per transaction',
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
            {
              name: 'from',
              in: 'query',
              schema: { type: 'string', format: 'date', example: '2026-06-01' },
              description: 'Start date — defaults to start of current month',
            },
            {
              name: 'to',
              in: 'query',
              schema: { type: 'string', format: 'date', example: '2026-06-30' },
              description: 'End date — defaults to today',
            },
          ],
          responses: {
            200: {
              description: 'Account statement',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/Statement' },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ── Account Lifecycle ───────────────────────────────────────────
      '/api/v1/customers/{id}/suspend': {
        patch: {
          tags: ['Customers'],
          summary: 'Suspend customer account',
          description:
            'Suspends the virtual account. Inbound payments will be recorded as misdirected.',
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['reason'],
                  properties: { reason: { type: 'string' } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Account suspended' },
            400: { description: 'Account already suspended or closed' },
          },
        },
      },

      '/api/v1/customers/{id}/unsuspend': {
        patch: {
          tags: ['Customers'],
          summary: 'Reactivate customer account',
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'Account reactivated' },
          },
        },
      },

      '/api/v1/customers/{id}/close': {
        patch: {
          tags: ['Customers'],
          summary: 'Close customer account',
          description:
            'Permanently closes the virtual account and expires it on Nomba. Cannot be undone.',
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { reason: { type: 'string' } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Account closed' },
            400: { description: 'Account already closed' },
          },
        },
      },

      // ── KYC ────────────────────────────────────────────────────────
      '/api/v1/customers/{id}/kyc': {
        get: {
          tags: ['KYC'],
          summary: 'Get customer KYC status',
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'KYC status and limits',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/KycStatus' },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['KYC'],
          summary: 'Submit customer KYC',
          description:
            'Merchant submits KYC details on behalf of their customer. Submitted for admin review.',
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['bvn', 'nin', 'dateOfBirth', 'address'],
                  properties: {
                    bvn: { type: 'string', example: '22212345678' },
                    nin: { type: 'string', example: '12345678901' },
                    dateOfBirth: { type: 'string', example: '1995-04-12' },
                    address: {
                      type: 'string',
                      example: '12 Adeola Odeku, Victoria Island, Lagos',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'KYC submitted for review' },
            400: {
              description: 'Already verified or pending submission exists',
            },
          },
        },
      },

      // ── Merchant ────────────────────────────────────────────────────
      '/api/merchants/me': {
        get: {
          tags: ['Merchant'],
          summary: 'Get merchant profile',
          description:
            'Returns merchant details, their own virtual account, and aggregate balance',
          security: [{ SessionAuth: [] }],
          responses: {
            200: {
              description: 'Merchant profile',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          merchant: { $ref: '#/components/schemas/Merchant' },
                          virtualAccount: {
                            $ref: '#/components/schemas/VirtualAccount',
                          },
                          balance: { type: 'number' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      '/api/merchants/keys/generate': {
        post: {
          tags: ['Keys'],
          summary: 'Generate API key',
          description:
            'Generates a new API key prefixed with ndva_. Shown once — store it securely.',
          security: [{ SessionAuth: [] }],
          responses: {
            201: {
              description: 'API key generated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          apiKey: {
                            type: 'string',
                            example: 'ndva_live_abc123...',
                          },
                          message: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Key already exists' },
          },
        },
      },

      '/api/merchants/keys/me': {
        get: {
          tags: ['Keys'],
          summary: 'Check API key status',
          description:
            'Returns whether a key exists and its prefix. Never returns the full key.',
          security: [{ SessionAuth: [] }],
          responses: {
            200: {
              description: 'Key status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          exists: { type: 'boolean' },
                          prefix: {
                            type: 'string',
                            nullable: true,
                            example: 'ndva_live_abc1...',
                          },
                          createdAt: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      '/api/merchants/keys/revoke': {
        delete: {
          tags: ['Keys'],
          summary: 'Revoke API key',
          description:
            'Revokes the current API key. Existing integrations will stop working immediately.',
          security: [{ SessionAuth: [] }],
          responses: {
            200: { description: 'Key revoked' },
            404: { description: 'No key found' },
          },
        },
      },

      // ── Admin ───────────────────────────────────────────────────────
      '/api/admin/kyc/{id}/approve': {
        patch: {
          tags: ['Admin'],
          summary: 'Approve KYC submission',
          description:
            'Upgrades the customer KYC tier. Admin session required.',
          security: [{ SessionAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'KYC approved and tier upgraded' },
            404: { description: 'Submission not found' },
          },
        },
      },

      '/api/admin/kyc/{id}/reject': {
        patch: {
          tags: ['Admin'],
          summary: 'Reject KYC submission',
          security: [{ SessionAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['reason'],
                  properties: { reason: { type: 'string', minLength: 10 } },
                },
              },
            },
          },
          responses: {
            200: { description: 'KYC rejected with reason' },
          },
        },
      },

      '/api/admin/reconcile': {
        post: {
          tags: ['Admin'],
          summary: 'Trigger reconciliation',
          description:
            'Compares local transaction records against Nomba ledger and recovers missed webhooks',
          security: [{ SessionAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['startDate', 'endDate'],
                  properties: {
                    startDate: {
                      type: 'string',
                      example: '2026-06-01T00:00:00',
                    },
                    endDate: { type: 'string', example: '2026-06-30T23:59:59' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Reconciliation result',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          totalFetched: { type: 'number' },
                          totalReconciled: { type: 'number' },
                          missedWithNoVA: { type: 'number' },
                          message: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        get: {
          tags: ['Admin'],
          summary: 'List reconciled transactions',
          description: 'Returns transactions recovered from missed webhooks',
          security: [{ SessionAuth: [] }],
          responses: {
            200: { description: 'Recovered transactions' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
