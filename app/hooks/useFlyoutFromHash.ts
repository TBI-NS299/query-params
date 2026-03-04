'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const FLYOUT_HASH = '#flyout';

/** pushState/replaceState don't fire hashchange; use this so all hook instances stay in sync */
const FLYOUT_HASH_CHANGED = 'flyout-hash-changed';

function getIsOpenFromHash(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hash === FLYOUT_HASH;
}

function syncFromHash(): boolean {
  return getIsOpenFromHash();
}

/**
 * Controls flyout open/close via URL hash (#flyout).
 * Hash is client-only (not sent to server). Back/forward works via popstate.
 * All instances stay in sync via a custom event when open/close is called.
 */
export function useFlyoutFromHash() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Sync from URL on mount and when hash changes (popstate or custom event from another instance)
  useEffect(() => {
    setIsOpen(syncFromHash());

    const handlePopState = () => setIsOpen(syncFromHash());
    const handleHashSync = () => setIsOpen(syncFromHash());

    window.addEventListener('popstate', handlePopState);
    window.addEventListener(FLYOUT_HASH_CHANGED, handleHashSync);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener(FLYOUT_HASH_CHANGED, handleHashSync);
    };
  }, []);

  const open = useCallback(() => {
    const search = searchParams.toString();
    const url = `${pathname}${search ? `?${search}` : ''}${FLYOUT_HASH}`;
    window.history.pushState(null, '', url);
    setIsOpen(true);
    window.dispatchEvent(new Event(FLYOUT_HASH_CHANGED));
  }, [pathname, searchParams]);

  const close = useCallback(() => {
    const search = searchParams.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    window.history.pushState(null, '', url);
    setIsOpen(false);
    window.dispatchEvent(new Event(FLYOUT_HASH_CHANGED));
  }, [pathname, searchParams]);

  return { isOpen, open, close };
}
