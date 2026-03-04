'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export type QueryParamsOptions = { replace?: boolean };

function searchParamsToState(searchParams: URLSearchParams): Record<string, string> {
  const state: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    state[key] = value;
  });
  return state;
}

/**
 * Sync state with plain URL search params (e.g. ?page=1&color=Blue).
 * Preserves URL hash when updating (e.g. #flyout).
 */
export function useQueryParams<T extends Record<string, string | number>>(
  initialData: T,
  paramKeys: (keyof T)[] = ['page', 'color', 'size', 'brand'] as (keyof T)[]
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo((): T => {
    const result = { ...initialData } as T;
    paramKeys.forEach((key) => {
      const str = searchParams.get(String(key));
      if (str === null || str === '') return;
      const k = String(key);
      if (k === 'page') {
        const n = parseInt(str, 10);
        (result as Record<string, unknown>)[k] = Number.isFinite(n) ? n : (initialData as Record<string, unknown>).page ?? 1;
      } else {
        (result as Record<string, unknown>)[k] = str;
      }
    });
    return result;
  }, [searchParams, initialData, paramKeys]);

  const buildUrl = useCallback(
    (params: URLSearchParams) => {
      const search = params.toString();
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      return `${pathname}${search ? `?${search}` : ''}${hash}`;
    },
    [pathname]
  );

  const updateParams = useCallback(
    (updater: (prev: T) => T, options: QueryParamsOptions = {}) => {
      const params = new URLSearchParams(searchParams.toString());
      const current: Record<string, string> = searchParamsToState(params);
      const prev = { ...initialData, ...current } as T;
      const next = updater(prev);

      const nextParams = new URLSearchParams();
      paramKeys.forEach((key) => {
        const val = (next as Record<string, unknown>)[String(key)];
        if (val !== undefined && val !== null && val !== '')
          nextParams.set(String(key), String(val));
      });

      const url = buildUrl(nextParams);
      if (options.replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router, pathname, searchParams, initialData, paramKeys, buildUrl]
  );

  const set = useCallback(
    (newValues: Partial<T>, options?: QueryParamsOptions) =>
      updateParams((prev) => ({ ...prev, ...newValues }), options),
    [updateParams]
  );

  const remove = useCallback(
    (keys: (keyof T)[], options?: QueryParamsOptions) =>
      updateParams((prev) => {
        const next = { ...prev };
        keys.forEach((k) => delete next[k]);
        return next;
      }, options),
    [updateParams]
  );

  const clear = useCallback(
    () =>
      updateParams(() => initialData, { replace: true }),
    [updateParams, initialData]
  );

  return { state, set, remove, clear, updateParams };
}
