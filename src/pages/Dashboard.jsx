import { useMemo, useState } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import BalanceTrendChart from "../components/BalanceTrendChart";
import SpendingPieChart from "../components/SpendingPieChart";
import TransactionModal from "../components/TransactionModal";
import PageTransition from "../components/PageTransition";
import useStore from "../store/useStore";

// ─── Sparkline — tiny inline chart ───────────────────────────
function Sparkline({ data, color, height = 40 }) {
  if (!data || data.length < 2) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${color})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Percentage badge ────────────────────────────────────────
function ChangeBadge({ value }) {
  if (value === null || value === undefined) return null;
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full
      ${positive
        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400"
      }`}
    >
      {positive ? "↑" : "↓"} {Math.abs(value).toFixed(1)}%
      <span className="font-normal text-[10px] ml-0.5 opacity-70">vs last mo</span>
    </span>
  );
}

// ─── Recent Activity item ────────────────────────────────────
function ActivityItem({ tx }) {
  const isIncome = tx.type === "income";
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm shrink-0
        ${isIncome
          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400"
        }`}>
        {isIncome ? "↗" : "↙"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{tx.category}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
      </div>
      <p className={`text-sm font-semibold ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
        {isIncome ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

// ─── Dashboard page ──────────────────────────────────────────
function Dashboard() {
  const transactions = useStore((s) => s.transactions);
  const role = useStore((s) => s.role);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("expense");

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lmDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lmDate.getFullYear()}-${String(lmDate.getMonth() + 1).padStart(2, "0")}`;

    const thisTx = transactions.filter((tx) => tx.date.startsWith(thisMonth));
    const lastTx = transactions.filter((tx) => tx.date.startsWith(lastMonth));

    const income     = thisTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses   = thisTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const balance    = income - expenses;

    const prevIncome   = lastTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const prevExpenses = lastTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const prevBalance  = prevIncome - prevExpenses;

    const pctChange = (curr, prev) => (prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / Math.abs(prev)) * 100);

    // Build daily sparkline data from recent transactions (last 30 days)
    const buildSparkline = (filterFn) => {
      const days = {};
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
        days[d.toISOString().slice(0, 10)] = 0;
      }
      transactions.filter(filterFn).forEach((tx) => {
        const dayKey = tx.date.slice(0, 10);
        if (days[dayKey] !== undefined) days[dayKey] += tx.amount;
      });
      return Object.values(days).map((v) => ({ v }));
    };

    return {
      balance, income, expenses,
      balanceChange: pctChange(balance, prevBalance),
      incomeChange:  pctChange(income, prevIncome),
      expenseChange: pctChange(expenses, prevExpenses),
      balanceSparkline: buildSparkline(() => true),
      incomeSparkline:  buildSparkline((t) => t.type === "income"),
      expenseSparkline: buildSparkline((t) => t.type === "expense"),
    };
  }, [transactions]);

  const recentTx = transactions.slice(0, 5);

  function openModal(type) {
    setModalType(type);
    setModalOpen(true);
  }

  return (
    <PageTransition>
    <section className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"} 👋
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          Here's what's happening with your finances today.
        </p>
      </div>

      {/* ── Hero Balance Card ── */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-[0_10px_40px_rgba(16,185,129,0.25)]">
        {/* Stripe overlay pattern */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 12px)" }} />
        {/* Background sparkline */}
        <div className="absolute inset-0 opacity-[0.12] pointer-events-none">
          <Sparkline data={stats.balanceSparkline} color="#fff" height={160} />
        </div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-emerald-200 text-xs font-medium uppercase tracking-wider mb-1">Total Balance</p>
              <p className="text-4xl md:text-5xl font-extrabold tracking-tight">
                ₹{stats.balance.toLocaleString("en-IN")}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg
                  ${stats.balanceChange >= 0
                    ? "bg-white/20 text-emerald-100"
                    : "bg-white/20 text-rose-200"
                  }`}
                >
                  {stats.balanceChange >= 0 ? "↑" : "↓"} {Math.abs(stats.balanceChange).toFixed(1)}% vs last month
                </span>
              </div>
            </div>
            {role === "admin" && (
              <div className="flex gap-2">
                <button
                  onClick={() => openModal("income")}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-sm"
                >
                  + Income
                </button>
                <button
                  onClick={() => openModal("expense")}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-sm"
                >
                  + Expense
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Income & Expenses cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Income card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 h-10 w-10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Income</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  ₹{stats.income.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <ChangeBadge value={stats.incomeChange} />
          </div>
          <div className="mt-3 -mx-1">
            <Sparkline data={stats.incomeSparkline} color="#10b981" height={48} />
          </div>
        </div>

        {/* Expenses card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 h-10 w-10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Expenses</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  ₹{stats.expenses.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <ChangeBadge value={stats.expenseChange} />
          </div>
          <div className="mt-3 -mx-1">
            <Sparkline data={stats.expenseSparkline} color="#f43f5e" height={48} />
          </div>
        </div>
      </div>

      {/* Charts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts take 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <BalanceTrendChart />
          <SpendingPieChart />
        </div>

        {/* Recent Activity sidebar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 h-fit">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">Recent Activity</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">{recentTx.length} latest</span>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {recentTx.map((tx) => (
              <ActivityItem key={tx.id} tx={tx} />
            ))}
          </div>
          {recentTx.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">No recent activity</p>
          )}
        </div>
      </div>
      <TransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} defaultType={modalType} />
    </section>
    </PageTransition>
  );
}

export default Dashboard;
