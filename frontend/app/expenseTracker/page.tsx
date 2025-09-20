import { authFetch } from '@/app/lib/auth-fetch';
import TransactionsClient from '@/app/expenseTracker/transactions-client';
import { PaginatedResponse } from '@/app/types/ExpenseTracker/PaginatedResult';


export default async function Page() {
  const pageSize = 20;
  const res = await authFetch(`${process.env.BASE_URL}/api/transactions/?page=1&page_size=${pageSize}`, { cache: 'no-store' });
  if (!res.ok) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center space-y-4">
        <p className="text-red-600 text-sm">Failed to load transactions ({res.status})</p>
      </main>
    );
  }
  const data: PaginatedResponse = await res.json();
  return (
    <main className="flex flex-1 flex-col items-center justify-start w-65 space-y-6">
      <TransactionsClient initialTransactions={data.items} initialMetadata={data.metadata} pageSize={pageSize} />
    </main>
  );
}
