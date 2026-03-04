This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

It demonstrates **URL params + flyout hash**:

- **Plain URL search params** for page and filters (e.g. `?page=1&color=Blue&size=M`). Read on the server and updated on the client; back/forward works.
- **URL hash** only for the layout flyout: `#flyout` means open; no hash means closed. Hash is client-only; the flyout in the layout opens/closes from the hash.

---

## URL Params & Flyout Hash — How It Works

### What this does

- **Query state** (page, filters) lives in **plain search params** (`?page=1&color=Blue`). You can read them in Server Components and update them in Client Components.
- **Flyout** is controlled by the **URL hash** `#flyout`. The layout renders a flyout that opens when the hash is present and closes when it’s removed; back/forward works for the flyout.
- No encoded/hashed query string; only normal params and one hash for the flyout.

---

## Implementation Steps

### Step 1: Define your state shape and defaults

Create a shared type and default object so server and client use the same shape. Put this in a file that can be imported from both server and client (e.g. `app/utils/server-query-state.ts`).

```ts
// app/utils/server-query-state.ts
export type QueryState = {
  page: number;
  color?: string;
  size?: string;
  brand?: string;
};

export const DEFAULT_QUERY_STATE: QueryState = {
  page: 1,
};
```

### Step 2: Server — read plain search params

The page receives `searchParams` as a **Promise** (Next 15+). Await it and pass it to `getServerQueryState` to get typed state from `?page=1&color=Blue`, etc.

```ts
// app/page.tsx
import { getServerQueryState } from '@/app/utils/server-query-state';

type PageProps = {
  searchParams: Promise<{ page?: string; color?: string; size?: string; brand?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const params = getServerQueryState(resolved);

  return (
    <main>
      <pre>{JSON.stringify(params, null, 2)}</pre>
      <HomePage initialServerState={params} />
    </main>
  );
}
```

`getServerQueryState` reads plain keys from `searchParams` (e.g. `page`, `color`, `size`, `brand`) and returns a `QueryState` object (with `page` as a number).

### Step 3: Client — read and update URL params with the hook

Use the `useQueryParams` hook in a **Client Component** (`'use client'`). It syncs with the URL search params and preserves the hash when updating (so `#flyout` is not lost).

```ts
// app/components/home.tsx
'use client';
import { useQueryParams } from '@/app/hooks/useQueryParams';
import { QueryState, DEFAULT_QUERY_STATE } from '@/app/utils/server-query-state';

const PARAM_KEYS: (keyof QueryState)[] = ['page', 'color', 'size', 'brand'];

export default function HomePage({ initialServerState }: HomePageProps = {}) {
  const { state, set, remove, clear } = useQueryParams<QueryState>(
    initialServerState ?? DEFAULT_QUERY_STATE,
    PARAM_KEYS
  );

  return (
    <>
      <p>Page: {state.page}</p>
      <button onClick={() => set({ page: state.page + 1 })}>Next</button>
      <button onClick={clear}>Clear all</button>
    </>
  );
}
```

- **`state`** — derived from current URL search params.
- **`set(newValues)`** — merge into params and update the URL (keeps existing hash).
- **`remove(keys)`** — remove those params from the URL.
- **`clear()`** — reset to initial state (e.g. `?page=1` only).

Pass `{ replace: true }` as the second argument to `set` or `remove` to avoid adding a history entry.

### Step 4: Flyout via URL hash (layout open/close)

The **flyout** is the only thing that uses the URL hash. When the URL has `#flyout`, the layout shows the flyout open; when the hash is missing, it’s closed. Use the `useFlyoutFromHash` hook:

```ts
'use client';
import { useFlyoutFromHash } from '@/app/hooks/useFlyoutFromHash';

const { isOpen, open, close } = useFlyoutFromHash();
// isOpen: true when URL ends with #flyout
// open(): pushState with #flyout (back/forward works)
// close(): pushState without hash
```

---

## Summary: Server vs Client

| Where              | What you do |
|--------------------|-------------|
| **Server Component** (e.g. page) | `await searchParams` → `getServerQueryState(resolved)` → use or pass `params` (e.g. as `initialServerState`). |
| **Client Component**             | `useQueryParams<QueryState>(initialData, paramKeys)` → use `state`, `set`, `remove`, `clear`. Pass `{ replace: true }` to avoid a history entry. |
| **Flyout (layout)**             | `useFlyoutFromHash()` → `isOpen`, `open`, `close`. Open/close is driven only by the URL hash `#flyout`. |

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
