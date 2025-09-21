"use client";
import { useState } from 'react';
import { Spinner } from '@chakra-ui/react';
import { fetchFinancialAnalysis } from '@/app/actions/financialAnalysis/fetchFinancialAnalysis';
import FinancialAnalysisClient from './FinancialAnalysisClient';

export default function Page() {
  const [analysis, setAnalysis] = useState<{ advice: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    const result = await fetchFinancialAnalysis(30);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-start w-full p-4">
      <section className="w-full max-w-3xl space-y-6">
        <h1 className="text-lg font-bold text-gray-700">Financial Analysis</h1>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-3 px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-base font-semibold"
        >
          {loading && <Spinner size='sm' />}
          {loading ? 'Analyzing... (may take ~30s)' : 'Start Financial Analysis'}
        </button>
        {analysis && (
          <FinancialAnalysisClient initialAdvice={analysis.advice} initialError={analysis.error} />
        )}
      </section>
    </main>
  );
}
