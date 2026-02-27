import HomePage from './components/home';
import { getServerQueryState } from '@/app/utils/server-query-state';

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function Home({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const params = getServerQueryState(resolved);
  return (
    <> <main className="min-h-screen p-8 font-sans text-gray-900 bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6">Hashed query state</h1>
      <section className="mb-8 p-4 rounded-lg bg-white shadow-sm border border-gray-200">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
          Current params - Server Component
        </h2>
        <pre className="text-sm overflow-x-auto text-gray-700">
          {JSON.stringify(params, null, 2)}
        </pre>
      </section>
      <HomePage initialServerState={params} />
    </main>
    </>
  );
}
