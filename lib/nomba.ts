let tokenCache: { token: string; expiresAt: number } | null = null;
const REFRESH_TIME_MS = 55 * 60 * 1000;

export async function getNombaToken() {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  const res = await fetch(`${process.env.NOMBA_BASE_URL}/v1/auth/token/issue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accountId: process.env.NOMBA_ACCOUNT_ID!,
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.NOMBA_CLIENT_ID,
      client_secret: process.env.NOMBA_CLIENT_SECRET,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Failed to fetch Nomba token: ${data.message || res.statusText}`,
    );
  }
  const token = data?.data?.access_token;
  if (!token) {
    throw new Error('Nomba returned no access_token');
  }
  tokenCache = {
    token,
    expiresAt: Date.now() + REFRESH_TIME_MS,
  };
  return tokenCache.token;
}

export async function fetchNombaTransactions(
  startDate: string,
  endDate: string,
  cursor?: string,
) {
  const token = await getNombaToken();

  const params = new URLSearchParams({
    startDate,
    endDate,
    limit: '50',
    ...(cursor ? { cursor } : {}),
  });

  const res = await fetch(
    `${process.env.NOMBA_BASE_URL}/v1/transactions/accounts/${process.env.NOMBA_SUB_ACCOUNT_ID}?${params}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        accountId: process.env.NOMBA_ACCOUNT_ID!,
      },
    },
  );
  const data = await res.json();

  if (data.code !== '00') {
    throw new Error(`Nomba transactions fetch failed: ${data.description}`);
  }

  return {
    results: data.data.results || [],
    cursor: data.data.cursor ?? null,
  };
}

export async function createVirtualAccount(
  accountName: string,
  accountRef: string,
) {
  const token = await getNombaToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/accounts/provision`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        accountId: process.env.NOMBA_ACCOUNT_ID!,
      },
      body: JSON.stringify({
        accountRef,
        accountName,
        currency: 'NGN',
      }),
    },
  );
  const data = await res.json();
  if (data.code !== '00') throw new Error(`Nomba error: ${data.description}`);

  return {
    accountRef,
    bankAccountNumber: data.data.accountNumber,
    bankAccountName: data.data.accountName,
    bankName: data.data.bankName,
  };
}
