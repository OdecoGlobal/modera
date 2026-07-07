export const fromKobo = (amount: number): number => amount / 100;
export const formatAmount = (amount: number): string =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(
    amount,
  );

export const formatNumber = (amount: number): string =>
  new Intl.NumberFormat('en-NG', { style: 'decimal' }).format(amount);
export const toKobo = (amount: number): number => Math.round(amount * 100);

export function formatString(text: string) {
  return text
    .split(/[_-]+/)
    .filter(Boolean)
    .map(t => {
      const lower = t.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
