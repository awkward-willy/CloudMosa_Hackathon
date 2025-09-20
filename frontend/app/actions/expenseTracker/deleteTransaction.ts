'use server';

import { authFetch } from '@/app/lib/auth-fetch';
import { DeleteActionState } from '@/app/types/ExpenseTracker/Transaction';

export async function deleteTransaction(id: string) {
  if (!id) throw new Error('Missing id');
  const res = await authFetch(`${process.env.BASE_URL}/api/transactions/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Delete failed (${res.status}): ${text}`);
  }
  return { id }; // 回傳被刪除的 id 用於前端移除列表
}

export async function deleteTransactionAction(
  _prev: DeleteActionState | undefined,
  formData: FormData
): Promise<DeleteActionState> {
  const id = String(formData.get('id') || '');
  if (!id) return { error: 'Missing ID' };
  try {
    await deleteTransaction(id);
    return { success: true, id };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Delete failed' };
  }
}

