'use client';

import { useFlyoutFromHash } from '@/app/hooks/useFlyoutFromHash';
import Flyout from './flyout';

export function QueryFlyout() {
  const { isOpen, close } = useFlyoutFromHash();

  return (
    <Flyout isOpen={isOpen} onClose={close} title="Flyout">
      <p className="text-gray-600">
        This panel is controlled by the URL hash <code className="rounded bg-gray-200 px-1">#flyout</code>.
        Close with the X button, the overlay, or Escape.
      </p>
    </Flyout>
  );
}
