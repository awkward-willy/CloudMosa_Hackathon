'use server';

import { authFetch } from '@/app/lib/auth-fetch';
import { CreateActionState, CreateTransactionInput } from '@/app/types/ExpenseTracker/Transaction';

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

