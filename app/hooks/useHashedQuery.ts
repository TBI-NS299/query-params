// hooks/useHashedQuery.ts
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { encrypt, decrypt } from '@/app/utils/crypto-query';

/** Pass `{ replace: true }` to avoid adding a history entry (use replaceState instead of pushState). */
export type HashedQueryOptions = { replace?: boolean };

export function useHashedQuery<T extends object>(initialData: T = {} as T) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qParam = searchParams.get('q');
  const initialRef = useRef(initialData);
  initialRef.current = initialData;

  // Internal helper to get current state from URL (stable deps: only q param string)
  const getUrlState = useCallback((): T => {
    return qParam ? (decrypt<T>(qParam) ?? initialRef.current) : initialRef.current;
  }, [qParam]);

  const [state, setState] = useState<T>(getUrlState);

  // Sync state when URL changes (e.g., via Back/Forward buttons)
  useEffect(() => {
    setState(getUrlState());
  }, [getUrlState]);

  const updateParams = useCallback(
    (updater: (prev: T) => T, options: HashedQueryOptions = {}) => {
      const nextState = updater(state);
      const encrypted = encrypt(nextState);
      const newUrl = `${pathname}?q=${encrypted}`;

      if (options.replace) {
        window.history.replaceState(null, '', newUrl);
      } else {
        window.history.pushState(null, '', newUrl);
      }
      setState(nextState);
    },
    [state, pathname]
  );

  return {
    state,
    updateParams,
    set: (newValues: Partial<T>, options?: HashedQueryOptions) =>
      updateParams(prev => ({ ...prev, ...newValues }), options),
    remove: (keys: (keyof T)[], options?: HashedQueryOptions) =>
      updateParams(prev => {
        const next = { ...prev };
        keys.forEach(k => delete next[k]);
        return next;
      }, options),
    clear: () => updateParams(() => initialRef.current, { replace: true }),
  };
}
