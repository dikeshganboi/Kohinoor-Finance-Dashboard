import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "./Card";
import useStore from "../store/useStore";

const COLORS = ["#10b981", "#14b8a6", "#f59e0b", "#f43f5e", "#0ea5e9", "#f97316", "#84cc16", "#06b6d4"];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: entry } = payload[0];
  const percent = entry?.percent;

  return (
    <div className="bg-slate-900 dark:bg-slate-800 shadow-2xl rounded-xl px-4 py-3 border border-slate-700 dark:border-slate-600">
      <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{name}</p>
      <p className="text-lg font-bold text-white mt-0.5">
        ₹{value.toLocaleString("en-IN")}{" "}
        <span className="text-sm text-slate-400 font-normal">({(percent * 100).toFixed(1)}%)</span>
      </p>
    </div>
  );
}

function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.08) return null;

  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function SpendingPieChart() {
  const transactions = useStore((s) => s.transactions);

  const spendingData = useMemo(() => {
    const categoryMap = {};
    transactions
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => {
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      });

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  return (
    <Card title="Spending Breakdown">
      {spendingData.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">No expense data</p>
      ) : (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={spendingData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={2}
            dataKey="value"
            label={renderLabel}
            labelLine={false}
            strokeWidth={0}
          >
            {spendingData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />

          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      )}
    </Card>
  );
}

export default SpendingPieChart;
