'use server';

import { authFetch } from '@/app/lib/auth-fetch';
import { FinancialAnalysisResult } from '@/app/types/financialAnalysis/Text';

export async function fetchFinancialAnalysis(days: number = 30): Promise<FinancialAnalysisResult> {
  try {
    // 先取得使用者資訊 (需要 id)
    const meRes = await authFetch(`${process.env.BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!meRes.ok) {
      return {
        advice: 'Failed to fetch financial analysis. Due to user authentication failure.',
        error: `Failed to fetch user (HTTP ${meRes.status})`,
      };
    }
    const meData: { id?: string } = await meRes.json();
    const user_uuid = meData?.id;
    if (!user_uuid) {
      return {
        advice: 'Failed to fetch financial analysis. Due to user authentication failure.',
        error: 'User id missing from /api/auth/me response',
      };
    }

    const res = await authFetch(`${process.env.BASE_URL}/api/advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days, output_format: 'text', user_uuid }),
    });
    if (!res.ok) {
      return {
        advice: 'Failed to fetch financial analysis.',
        error: `HTTP ${res.status}`,
      };
    }
    // 後端 finance router 將 text 直接包成 {advice: string}
    const data = await res.json().catch(() => null);
    let advice: string = data?.advice ?? 'No advice available.';
    advice = advice.replace(/\n\n/g, '\n\n');
    advice = advice.replace(/\\n/g, '\n');
    if ((advice.startsWith('"') && advice.endsWith('"')) || (advice.startsWith("'") && advice.endsWith("'"))) {
      advice = advice.slice(1, -1).trim();
    }
    return { advice };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { advice: 'An unknown error occurred while fetching financial analysis.', error: message };
  }
}

