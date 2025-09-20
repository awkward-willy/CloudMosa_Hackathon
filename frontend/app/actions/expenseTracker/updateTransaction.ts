'use server';

import { authFetch } from '@/app/lib/auth-fetch';
import { UpdateActionState } from '@/app/types/ExpenseTracker/Transaction';
import { TransactionPutPayload } from '@/app/types/ExpenseTracker/TransactionPutPayload';

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
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update failed (${res.status}): ${text}`);
  }
  return res.json();
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

