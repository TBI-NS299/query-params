This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

It demonstrates **hashed query params**: keeping all UI state (filters, page, flyout, etc.) in a single `?q=...` encoded value so the URL stays clean and the same state can be read on both the server and the client.

---

## Hashed Query Params — How It Works

### What problem it solves

- You want many values in the URL (page, filters, open panels) without a long, readable query string.
- You want to **read** that state in **Server Components** (e.g. for SEO or initial HTML) and **update** it in **Client Components** (e.g. buttons, forms).
- You want back/forward to work and optional control over whether an update adds a history entry.

### High-level flow

1. **State** is a plain object (e.g. `{ page: 1, color: 'Blue', flyout: 'true' }`).
2. It is **encoded** (e.g. base64) into a single string and put in the URL as `?q=<encoded>`.
3. **Server**: the page receives `searchParams`; you decode `q` to get the state and pass it down (or use it for rendering).
4. **Client**: a hook reads `q` from the URL, keeps it in React state, and updates the URL when the user changes filters/page/etc.

---

## Implementation Steps

### Step 1: Define your state shape and defaults

Create a shared type and default object so server and client use the same shape. Put this in a file that can be imported from both server and client (e.g. `app/utils/server-query-state.ts`).

```ts
// app/utils/server-query-state.ts
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
```

### Step 2: Encode and decode the state (crypto-query) It can also be key protected - code is commented.

You need two functions: one that turns your state object into a string for the URL, and one that turns the `q` string back into an object. This app uses base64 (see `app/utils/crypto-query.ts`); you can swap in AES or another encoding.

- **`encrypt(data)`** → string (goes in `?q=...`)
- **`decrypt<T>(string)`** → `T | null`

Both must be callable on the **server** (e.g. Node `Buffer`) and, if you decode on the client, in the browser (e.g. `atob`/`btoa` or the same logic).

### Step 3: Server — parse `searchParams` in the page

In Next.js App Router, the **page** is a Server Component and receives `searchParams` as a **Promise** (Next 15+). Await it, then decode `q` to get your state.

```ts
// app/page.tsx
import { getServerQueryState } from '@/app/utils/server-query-state';

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function Home({ searchParams }: PageProps) {
  const resolved = await searchParams;   // Next 15+: searchParams is a Promise
  const params = getServerQueryState(resolved);

  return (
    <main>
      {/* Use params for server-rendered content */}
      <pre>{JSON.stringify(params, null, 2)}</pre>
      {/* Pass to client so first paint matches */}
      <HomePage initialServerState={params} />
    </main>
  );
}
```

Helper used above:

```ts
// app/utils/server-query-state.ts
import { decrypt } from '@/app/utils/crypto-query';

export function getServerQueryState(
  searchParams: { q?: string | string[] } | null | undefined
): QueryState {
  const q = searchParams?.q;
  const raw = Array.isArray(q) ? q[0] : q;
  if (!raw) return DEFAULT_QUERY_STATE;
  const parsed = decrypt<QueryState>(raw);
  return parsed ?? DEFAULT_QUERY_STATE;
}
```

### Step 4: Client — read and update state with the hook

Use the `useHashedQuery` hook in a **Client Component** (`'use client'`). Pass the same default/initial state type and, when the page is server-rendered, pass the server-parsed state so the first paint matches the URL.

```ts
// app/components/home.tsx
'use client';
import { useHashedQuery } from '@/app/hooks/useHashedQuery';
import { QueryState, DEFAULT_QUERY_STATE } from '@/app/utils/server-query-state';

type HomePageProps = { initialServerState?: QueryState };

export default function HomePage({ initialServerState }: HomePageProps = {}) {
  const { state, set, remove, clear } = useHashedQuery<QueryState>(
    initialServerState ?? DEFAULT_QUERY_STATE
  );

  return (
    <>
      <p>Page: {state.page}</p>
      <button onClick={() => set({ page: state.page + 1 })}>Next</button>
      <button onClick={() => remove(['flyout'])}>Close flyout</button>
      <button onClick={clear}>Clear all</button>
    </>
  );
}
```

- **`state`** — current state (from URL).
- **`set(newValues)`** — merge new values into state and update the URL.
- **`remove(keys)`** — remove keys from state and update the URL.
- **`clear()`** — reset to the initial state and update the URL.

### Step 5: Optional — avoid adding a history entry

By default, updates use `pushState` (back/forward works). To update the URL **without** adding a history entry (e.g. for filters or pagination), pass `{ replace: true }`:

```ts
set({ page: 2 }, { replace: true });
remove(['color'], { replace: true });
```

Use the default (no second argument) for things you want in history (e.g. opening/closing a flyout).

---

## Summary: Server vs Client

| Where              | What you do |
|--------------------|-------------|
| **Server Component** (e.g. page) | `await searchParams` → `getServerQueryState(resolved)` → use or pass `params` (e.g. as `initialServerState`). |
| **Client Component**             | `useHashedQuery<YourState>(initialData)` with `initialServerState` when provided → use `state`, `set`, `remove`, `clear`; pass `{ replace: true }` to avoid a history entry. |

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
