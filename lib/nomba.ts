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
  tokenCache = {
    token: data.access_token,
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
  console.log('NOMBA', token);

  const params = new URLSearchParams({
    startDate,
    endDate,
    limit: '50',
    ...(cursor ? { cursor } : {}),
  });

  const res = await fetch(
    `${process.env.NOMBA_BASE_URL}/v1/transactions/accounts?${params}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        accountId: process.env.NOMBA_PARENT_ACC_ID!,
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
