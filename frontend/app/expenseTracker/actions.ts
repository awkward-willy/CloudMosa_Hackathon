'use server';

import { authFetch } from '@/app/lib/auth-fetch';

export interface TransactionPutPayload {
  id: string;
  description: string;
  amount: number;
  type: string;
  income: boolean;
}

export async function updateTransaction(payload: TransactionPutPayload) {
  const { id, description, amount, type, income } = payload;
  const res = await authFetch(`${process.env.BASE_URL}/api/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ description, amount, type, income }),
    cache: 'no-store',
  });
  console.log('Update response:', res);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update failed (${res.status}): ${text}`);
  }
  return res.json();
}

// Form action variant used with useActionState
interface TransactionShape {
  id: string;
  income: boolean;
  description: string;
  amount: number;
  type: string;
  time: string;
}

interface UpdateActionState {
  success?: boolean;
  error?: string;
  transaction?: TransactionShape;
}

// ---- Create Transaction ----
export interface CreateTransactionInput {
  description: string;
  amount: number;
  type: string;
  income: boolean;
}

export async function createTransaction(input: CreateTransactionInput) {
  const base = process.env.BASE_PATH || process.env.BASE_URL;
  const res = await authFetch(`${base}/api/transactions/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create failed (${res.status}): ${text}`);
  }
  return res.json();
}

export interface CreateActionState {
  success?: boolean;
  error?: string;
  created?: TransactionShape;
}

export async function createTransactionAction(
  _prev: CreateActionState | undefined,
  formData: FormData
): Promise<CreateActionState> {
  const description = String(formData.get('description') || '').trim();
  const amountStr = String(formData.get('amount') || '0');
  const type = String(formData.get('type') || '').trim();
  const income = formData.get('income') === 'on';
  const amount = parseFloat(amountStr);
  if (!description) return { error: 'Description is required' };
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be a positive number' };
  if (!type) return { error: 'Type is required' };
  try {
    const created = await createTransaction({ description, amount, type, income });
    return { success: true, created };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Create failed' };
  }
}

export async function updateTransactionAction(_prevState: UpdateActionState | undefined, formData: FormData) {
  const id = String(formData.get('id'));
  if (!id) return { error: 'Missing ID' };
  const description = String(formData.get('description') || '').trim();
  const amountStr = String(formData.get('amount') || '0');
  const type = String(formData.get('type') || '').trim();
  const income = formData.get('income') === 'on';
  const amount = parseFloat(amountStr);
  if (!description) return { error: 'Description is required' };
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be a positive number' };
  if (!type) return { error: 'Type is required' };
  try {
    const updated = await updateTransaction({ id, description, amount, type, income });
    return { success: true, transaction: updated };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Update failed' };
  }
}

// Load more transactions (server action-friendly plain function)
export interface PaginatedResult {
  items: TransactionShape[];
  metadata: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// New page/page_size based pagination (page starts at 1)
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

/**
 * @deprecated Use fetchTransactionsPage instead. This remains for backward compatibility.
 */
export async function loadMoreTransactions(skip: number, limit: number): Promise<PaginatedResult> {
  // Convert skip/limit to page/page_size if still called somewhere
  const pageSize = limit;
  const page = Math.floor(skip / pageSize) + 1; // assuming skip = (page-1)*pageSize
  return fetchTransactionsPage(page, pageSize);
}

