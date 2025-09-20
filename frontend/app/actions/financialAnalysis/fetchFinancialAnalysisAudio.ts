'use server';

import { authFetch } from '@/app/lib/auth-fetch';
import { FinancialAnalysisAudioResult } from '@/app/types/financialAnalysis/Audio';

export async function fetchFinancialAnalysisAudio(days: number = 30): Promise<FinancialAnalysisAudioResult> {
  try {
    const meRes = await authFetch(`${process.env.BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!meRes.ok) {
      return { error: `Failed to fetch user (HTTP ${meRes.status})` };
    }
    const meData: { id?: string } = await meRes.json();
    const user_uuid = meData?.id;
    if (!user_uuid) {
      return { error: 'User id missing from /api/auth/me response' };
    }

    const res = await authFetch(`${process.env.BASE_URL}/api/advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days, output_format: 'audio', user_uuid }),
    });
    if (!res.ok) {
      return { error: `Failed to fetch audio (HTTP ${res.status})` };
    }
    const buffer = await res.arrayBuffer();
    return { audioBuffer: buffer };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: message };
  }
}

