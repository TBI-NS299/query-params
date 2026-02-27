'use client';
import { useHashedQuery } from '@/app/hooks/useHashedQuery';
import {
  QueryState,
  DEFAULT_QUERY_STATE,
  FILTER_CHIP_OPTIONS,
} from '@/app/utils/server-query-state';

type HomePageProps = { initialServerState?: QueryState };

export default function HomePage({ initialServerState }: HomePageProps = {}) {
  const { state, set, remove, clear } = useHashedQuery<QueryState>(
    initialServerState ?? DEFAULT_QUERY_STATE
  );

  return (
    <>
      <section className="mb-8 p-4 rounded-lg bg-white shadow-sm border border-gray-200">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
          Current params - Client Component
        </h2>
        <pre className="text-sm overflow-x-auto text-gray-700">
          {JSON.stringify(state, null, 2)}
        </pre>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 w-full">Filters:</span>
          {FILTER_CHIP_OPTIONS.map(({ key, label, sampleValue }) => {
            const value = state[key];
            return value ? (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-200 py-1.5 pl-3 pr-1.5 text-sm text-gray-800"
              >
                <span className="font-medium">{label}:</span>
                <span>{value}</span>
                <button
                  type="button"
                  onClick={() => remove([key], { replace: true })}
                  className="rounded-full p-0.5 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label={`Remove ${label}`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ) : (
              <button
                key={key}
                type="button"
                onClick={() => set({ [key]: sampleValue }, { replace: true })}
                className="rounded-full border border-dashed border-gray-400 py-1.5 px-3 text-sm text-gray-600 hover:border-gray-500 hover:text-gray-700"
              >
                + {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Page:</span>
          <div className="inline-flex items-center rounded-lg border border-gray-300 bg-gray-50 p-0.5">
            <button
              type="button"
              onClick={() => set({ page: state.page - 1 })}
              disabled={state.page <= 1}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            >
              Previous
            </button>
            <code className="min-w-[2.5rem] px-2 py-1.5 text-center text-sm text-gray-800">
              {state.page}
            </code>
            <button
              type="button"
              onClick={() => set({ page: state.page + 1 })}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-600">Flyout:</span>
          <button
            type="button"
            onClick={() =>
              state.flyout === 'true' ? remove(['flyout']) : set({ flyout: 'true' })
            }
            className="px-3 py-1.5 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 text-sm font-medium"
          >
            Set flyout to {state.flyout === 'true' ? 'false' : 'true'}
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={clear}
            className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 text-sm font-medium"
          >
            Clear all
          </button>
        </div>
      </section>
    </>
  );
}
