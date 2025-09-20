'use server';

import { authFetch } from '../../lib/auth-fetch';
import { FinancialTipResult } from '../../types/FinancialTips/FinancialTipResult';

export async function fetchFinancialTip(): Promise<FinancialTipResult> {
  try {
    const baseURL = process.env.BASE_URL;
    const res = await authFetch(`${baseURL}/api/tip`, {
      method: 'POST',
    });
    if (!res.ok) {
      return { tip: 'Failed to fetch financial tip.', error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    let tip = typeof data?.tip === 'string' && data.tip.trim() !== '' ? data.tip : 'No tip available.';
    tip = tip.replace(/\n\n/g, '\n\n');
    tip = tip.replace(/\\n/g, '\n');
    if ((tip.startsWith('"') && tip.endsWith('"')) || (tip.startsWith("'") && tip.endsWith("'"))) {
      tip = tip.slice(1, -1).trim();
    }
    return { tip };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { tip: 'Failed to fetch financial tip.', error: message };
  }
}

