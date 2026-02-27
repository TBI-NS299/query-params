'use client';

import { useHashedQuery } from '@/app/hooks/useHashedQuery';
import type { QueryState } from '@/app/utils/server-query-state';
import { DEFAULT_QUERY_STATE } from '@/app/utils/server-query-state';
import Flyout from './flyout';

export function QueryFlyout() {
  const { state, remove } = useHashedQuery<QueryState>(DEFAULT_QUERY_STATE);
  const isOpen = state.flyout === 'true';

  return (
    <Flyout isOpen={isOpen} onClose={() => remove(['flyout'])} title="Flyout">
      <p className="text-gray-600">
        This panel is controlled by the <code className="rounded bg-gray-200 px-1">flyout</code> query
        param. Close with the X button, the overlay, or Escape.
      </p>
    </Flyout>
  );
}
