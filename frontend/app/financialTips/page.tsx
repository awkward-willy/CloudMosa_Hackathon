import ReactMarkdown from "react-markdown";
import { fetchFinancialTip } from "@/app/actions/FinancialTips/fetchFinancialTip";

export const dynamic = "force-dynamic"; // always fetch fresh tip

export default async function Page() {
  const { tip, error } = await fetchFinancialTip();
  return (
    <main className="flex flex-1 flex-col items-center justify-start w-full space-y-6 p-4">
      <section className="w-full max-w-3xl text-left">
        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            Error: {error}
          </div>
        )}
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
          <ReactMarkdown>{tip}</ReactMarkdown>
        </div>
      </section>
    </main>
  );
}