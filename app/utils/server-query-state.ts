import { decrypt } from '@/app/utils/crypto-query';

export type QueryState = {
  page: number;
  flyout?: string;
  color?: string;
  size?: string;
  brand?: string;
};

export const DEFAULT_QUERY_STATE: QueryState = {
  page: 1,
};

export const FILTER_CHIP_OPTIONS = [
  { key: 'color' as const, label: 'Color', sampleValue: 'Blue' },
  { key: 'size' as const, label: 'Size', sampleValue: 'M' },
  { key: 'brand' as const, label: 'Brand', sampleValue: 'Acme' },
];

/**
 * Parse hashed query param on the server (e.g. in Page or Server Components).
 * Use this to read ?q=... and get typed state without client hooks.
 */
export function getServerQueryState(
  searchParams: { q?: string | string[] } | null | undefined
): QueryState {
  const q = searchParams?.q;
  const raw = Array.isArray(q) ? q[0] : q;
  if (!raw) return DEFAULT_QUERY_STATE;
  const parsed = decrypt<QueryState>(raw);
  return parsed ?? DEFAULT_QUERY_STATE;
}
