import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';
import { TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

// ── Custom Tooltip ──
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel px-3 py-2 rounded-lg border border-border shadow-xl">
        <p className="text-xs font-medium text-text-primary">
          {payload[0].payload.name}: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export default function MiniReportCard({ income, expenses }) {
  const totalIncome = income.reduce((sum, i) => sum + i.value, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0);
  const net = totalIncome - totalExpenses;

  const chartData = [
    ...income.map((i) => ({
      name: i.category,
      value: i.value,
      type: 'income',
    })),
    ...expenses.map((e) => ({
      name: e.category,
      value: e.value,
      type: 'expense',
    })),
  ];

  return (
    <div className="flex justify-start w-full animate-slide-up">
      <div className="max-w-[85%] md:max-w-[65%] w-full">
        <div className="glass-card rounded-lg overflow-hidden">
          {/* Title */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <PieChart className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">
              📊 Mini Report
            </h3>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-2 px-4 py-2">
            <div className="bg-income/10 rounded-lg p-3 border border-income/20">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-income" />
                <span className="text-[10px] uppercase tracking-wider text-income font-medium">
                  Income
                </span>
              </div>
              <p className="text-lg font-bold text-income">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="bg-expense/10 rounded-lg p-3 border border-expense/20">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-3.5 h-3.5 text-expense" />
                <span className="text-[10px] uppercase tracking-wider text-expense font-medium">
                  Expenses
                </span>
              </div>
              <p className="text-lg font-bold text-expense">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="px-4 py-2">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#8696a0', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8696a0', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${v}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.type === 'income' ? '#00a884' : '#f97316'}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Net balance */}
          <div className="px-4 pb-4 pt-1">
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
              <span className="text-xs text-text-secondary">Net balance</span>
              <span
                className={`text-sm font-bold ${
                  net >= 0 ? 'text-income' : 'text-danger'
                }`}
              >
                {formatCurrency(net)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
