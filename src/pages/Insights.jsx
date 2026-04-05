import { useMemo } from "react";
import Card from "../components/Card";
import PageTransition from "../components/PageTransition";
import useStore from "../store/useStore";

/**
 * Insights — Analytics page derived from transaction data
 *
 * Calculates:
 *   1. Highest spending category
 *   2. Total expenses this month
 *   3. Total income this month
 *   4. Monthly comparison (this month vs last month)
 */

// ─── Helpers ─────────────────────────────────────────────────
function fmt(n) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function getMonth(dateStr) {
  return dateStr.slice(0, 7); // "2026-04"
}

// ─── Insight card sub-component ──────────────────────────────
function InsightCard({ icon, title, value, description, accent }) {
  return (
    <div
      className={`${accent.bg} rounded-2xl border border-slate-100 dark:border-slate-700 p-6
                  hover:shadow-lg hover:-translate-y-1
                  transition-all duration-300 ease-out`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`${accent.iconBg} h-10 w-10 rounded-xl flex items-center
                      justify-center`}
        >
          {icon}
        </span>
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
      </div>

      <p className={`text-2xl font-bold ${accent.text} tracking-tight`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{description}</p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────
function Insights() {
  const transactions = useStore((s) => s.transactions);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonth = `${now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()}-${String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, "0")}`;

    // ── Partition by month ──
    const thisMonthTx = transactions.filter((tx) => getMonth(tx.date) === thisMonth);
    const lastMonthTx = transactions.filter((tx) => getMonth(tx.date) === lastMonth);

    // ── This month totals ──
    const incomeThisMonth = thisMonthTx
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expensesThisMonth = thisMonthTx
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    // ── Last month totals ──
    const expensesLastMonth = lastMonthTx
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const incomeLastMonth = lastMonthTx
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    // ── Highest spending category (all time) ──
    const categoryTotals = {};
    transactions
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      });

    let topCategory = "—";
    let topAmount = 0;
    for (const [cat, total] of Object.entries(categoryTotals)) {
      if (total > topAmount) {
        topCategory = cat;
        topAmount = total;
      }
    }

    // ── Month-over-month change ──
    const expenseDiff = expensesThisMonth - expensesLastMonth;
    const expenseDirection = expenseDiff > 0 ? "up" : expenseDiff < 0 ? "down" : "same";
    const percentChange =
      expensesLastMonth === 0
        ? 0
        : ((expenseDiff / expensesLastMonth) * 100).toFixed(1);

    return {
      incomeThisMonth,
      expensesThisMonth,
      expensesLastMonth,
      incomeLastMonth,
      topCategory,
      topAmount,
      expenseDiff,
      expenseDirection,
      percentChange,
    };
  }, [transactions]);

  // ─── Card data ─────────────────────────────────────────────
  const cards = [
    {
      icon: (
        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
        </svg>
      ),
      title: "Highest Spending Category",
      value: stats.topCategory,
      description: `Total spent: ${fmt(stats.topAmount)} across all months`,
      accent: { bg: "bg-amber-50 dark:bg-amber-950/40", iconBg: "bg-amber-100 dark:bg-amber-900/50", text: "text-amber-700 dark:text-amber-400" },
    },
    {
      icon: (
        <svg className="w-5 h-5 text-rose-500 dark:text-rose-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
        </svg>
      ),
      title: "Expenses This Month",
      value: fmt(stats.expensesThisMonth),
      description: stats.expensesThisMonth === 0
        ? "No expenses recorded yet"
        : `Across ${new Date().toLocaleString("en-IN", { month: "long" })}`,
      accent: { bg: "bg-rose-50 dark:bg-rose-950/40", iconBg: "bg-rose-100 dark:bg-rose-900/50", text: "text-rose-600 dark:text-rose-400" },
    },
    {
      icon: (
        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
        </svg>
      ),
      title: "Income This Month",
      value: fmt(stats.incomeThisMonth),
      description: stats.incomeThisMonth === 0
        ? "No income recorded yet"
        : `Earnings in ${new Date().toLocaleString("en-IN", { month: "long" })}`,
      accent: { bg: "bg-emerald-50 dark:bg-emerald-950/40", iconBg: "bg-emerald-100 dark:bg-emerald-900/50", text: "text-emerald-600 dark:text-emerald-400" },
    },
    {
      icon: (
        <svg className={`w-5 h-5 ${stats.expenseDirection === "up" ? "text-rose-500" : stats.expenseDirection === "down" ? "text-emerald-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
        </svg>
      ),
      title: "Monthly Comparison",
      value:
        stats.expenseDirection === "same"
          ? "No change"
          : `${stats.expenseDirection === "up" ? "+" : "-"} ${fmt(Math.abs(stats.expenseDiff))} (${Math.abs(stats.percentChange)}%)`,
      description: `Expenses ${stats.expenseDirection === "up" ? "increased" : stats.expenseDirection === "down" ? "decreased" : "unchanged"} vs last month (${fmt(stats.expensesLastMonth)})`,
      accent:
        stats.expenseDirection === "up"
          ? { bg: "bg-rose-50 dark:bg-rose-950/40", iconBg: "bg-rose-100 dark:bg-rose-900/50", text: "text-rose-600 dark:text-rose-400" }
          : stats.expenseDirection === "down"
            ? { bg: "bg-emerald-50 dark:bg-emerald-950/40", iconBg: "bg-emerald-100 dark:bg-emerald-900/50", text: "text-emerald-600 dark:text-emerald-400" }
            : { bg: "bg-slate-50 dark:bg-slate-800", iconBg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-400" },
    },
  ];

  // ─── Empty-state safety ─────────────────────────────────────
  if (transactions.length === 0) {
    return (
      <PageTransition>
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Insights
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
            Key takeaways from your transaction history
          </p>
        </div>
        <Card>
          <p className="py-12 text-center text-slate-400 dark:text-slate-500">No data available</p>
        </Card>
      </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
    <section className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Insights
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          Key takeaways from your transaction history
        </p>
      </div>

      {/* Insight cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <InsightCard key={card.title} {...card} />
        ))}
      </div>

      {/* Breakdown table */}
      <Card title="Category Breakdown">
        <div className="overflow-x-auto">
          {(() => {
            const rows = Object.entries(
              transactions
                .filter((tx) => tx.type === "expense")
                .reduce((acc, tx) => {
                  acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
                  return acc;
                }, {})
            ).sort(([, a], [, b]) => b - a);

            const max = rows.length > 0 ? rows[0][1] : 1;

            return (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 font-medium">Distribution</th>
                    <th className="pb-2 font-medium text-right">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {rows.map(([category, total]) => (
                    <tr key={category} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="py-2.5 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                        {category}
                      </td>
                      <td className="py-2.5 px-4 w-1/2">
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded">
                          <div
                            style={{ width: `${(total / max) * 100}%` }}
                            className="bg-emerald-500 dark:bg-emerald-400 h-2 rounded transition-all duration-500"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {fmt(total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
      </Card>
    </section>
    </PageTransition>
  );
}

export default Insights;
