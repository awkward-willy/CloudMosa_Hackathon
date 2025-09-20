'use server';

import { authFetch } from '@/app/lib/auth-fetch';
import { PaginatedResult } from '@/app/types/ExpenseTracker/PaginatedResult';

export async function fetchTransactionsPage(page: number, pageSize: number): Promise<PaginatedResult> {
  const safePage = page < 1 ? 1 : page; // guard
  const url = `${process.env.BASE_URL}/api/transactions/?page=${safePage}&page_size=${pageSize}`;
  const res = await authFetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to load transactions page ${safePage} (${res.status}): ${text}`);
  }
  return res.json();
}

