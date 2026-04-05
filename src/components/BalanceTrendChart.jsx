import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import Card from "./Card";
import useStore from "../store/useStore";

const SHORT_MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 dark:bg-slate-800 shadow-2xl rounded-xl px-4 py-3 border border-slate-700 dark:border-slate-600">
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-white mt-0.5">
        ₹{payload[0].value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function BalanceTrendChart() {
  const transactions = useStore((s) => s.transactions);
  const theme = useStore((s) => s.theme);
  const gridStroke = theme === "dark" ? "#334155" : "#e2e8f0";

  const balanceData = useMemo(() => {
    const monthMap = {};

    transactions.forEach((tx) => {
      const key = tx.date.slice(0, 7); // "YYYY-MM"
      if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
      if (tx.type === "income") monthMap[key].income += tx.amount;
      else monthMap[key].expense += tx.amount;
    });

    return Object.keys(monthMap)
      .sort()
      .map((key) => ({
        month: SHORT_MONTH[parseInt(key.slice(5, 7), 10) - 1],
        balance: monthMap[key].income - monthMap[key].expense,
      }));
  }, [transactions]);

  return (
    <Card title="Balance Trend">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={balanceData}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            width={55}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#10b981", strokeWidth: 1, strokeDasharray: "4 4" }} />

          <Area
            type="monotone"
            dataKey="balance"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#balanceGradient)"
            dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default BalanceTrendChart;
