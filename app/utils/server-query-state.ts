export type QueryState = {
  page: number;
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

type SearchParamsRecord = { [key: string]: string | string[] | undefined };

function getStr(param: string | string[] | undefined): string | undefined {
  if (param == null) return undefined;
  return Array.isArray(param) ? param[0] : param;
}

/**
 * Read query state from plain URL search params (e.g. ?page=1&color=Blue).
 * Use in Server Components (page receives searchParams as Promise).
 */
export function getServerQueryState(
  searchParams: SearchParamsRecord | null | undefined
): QueryState {
  if (!searchParams) return DEFAULT_QUERY_STATE;
  const pageStr = getStr(searchParams.page);
  const page = pageStr ? parseInt(pageStr, 10) : 1;
  return {
    page: Number.isFinite(page) ? page : 1,
    color: getStr(searchParams.color) ?? undefined,
    size: getStr(searchParams.size) ?? undefined,
    brand: getStr(searchParams.brand) ?? undefined,
  };
}
