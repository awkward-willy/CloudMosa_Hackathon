import ReactMarkdown from "react-markdown";

export const financialTipMD = `
**Simple Budgeting for Better Money Management**

Managing your money can feel hard, but a simple budget helps you understand where your money goes. A budget is like a plan for your money, so you can make sure you have enough for what's important.

1. Write down all your money coming in each month. This includes your salary, any extra money from work, or help from family.
2. List all your spending. Think about food, transport, rent, and other things you pay for. Use a notebook or phone app.
3. Compare your income and spending. See if you have more money coming in than going out. If not, think about ways to reduce spending.

Example: I wrote down my $200 salary and $50 from extra work. Then I listed $100 for food, $50 for transport, and $30 for other things.

Common mistake: Not writing down all your spending, especially small amounts.

Tiny challenge: Write down everything you spend today, no matter how small.

Tags: budgeting, personal finance, saving money · Level: A1
`;

export default function Page() {
  return (
    <main className="flex flex-1 flex-col items-center justify-start w-full space-y-6 p-4">
      <section className="w-full max-w-3xl text-left">
        <ReactMarkdown>
          {financialTipMD}
        </ReactMarkdown>
      </section>
    </main>
  );
}