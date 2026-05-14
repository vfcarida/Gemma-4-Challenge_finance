import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { formatCurrency } from '../hooks/useChat';

// ── Custom Tooltip for detailed month-over-month data ──
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel px-3 py-2 rounded-lg border border-border shadow-xl text-xs">
        <p className="font-medium text-text-primary mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
}

export default function FullReportCard({ income, expenses, historicalData }) {
  const totalIncome = income.reduce((s, i) => s + i.value, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.value, 0);

  // Retrieve historical context from mock database
  const prevMonth = historicalData?.['abril'] || { income: [], expenses: [] };
  const prevIncome = prevMonth.income.reduce((s, i) => s + i.value, 0);
  const prevExpenses = prevMonth.expenses.reduce((s, e) => s + e.value, 0);

  const prev2Month = historicalData?.['março'] || { income: [], expenses: [] };
  const prev2Income = prev2Month.income.reduce((s, i) => s + i.value, 0);
  const prev2Expenses = prev2Month.expenses.reduce((s, e) => s + e.value, 0);

  const chartData = [
    { month: 'Mar', Receitas: prev2Income, Despesas: prev2Expenses },
    { month: 'Abr', Receitas: prevIncome, Despesas: prevExpenses },
    { month: 'Mai', Receitas: totalIncome, Despesas: totalExpenses },
  ];

  // Category breakdown with automated comparison logic
  const allCategories = new Set();
  expenses.forEach((e) => allCategories.add(e.category));
  prevMonth.expenses.forEach((e) => allCategories.add(e.category));

  const categoryComparison = [...allCategories].map((cat) => {
    const cur = expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.value, 0);
    const prev = prevMonth.expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.value, 0);
    const change = prev > 0 ? Math.round(((cur - prev) / prev) * 100) : (cur > 0 ? 100 : 0);
    return { category: cat, current: cur, previous: prev, change };
  });

  const incomeChange = prevIncome > 0 ? Math.round(((totalIncome - prevIncome) / prevIncome) * 100) : 0;
  const expenseChange = prevExpenses > 0 ? Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100) : 0;

  return (
    <div className="flex justify-start w-full animate-slide-up">
      <div className="max-w-[85%] md:max-w-[65%] w-full">
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-1">
            <Calendar className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">📊 Relatório Mensal — Maio</h3>
          </div>

          {/* Monthly Financial Summary Cards */}
          <div className="grid grid-cols-2 gap-2 px-4 py-2">
            <div className="bg-income/10 rounded-lg p-2.5 border border-income/20">
              <span className="text-[10px] uppercase tracking-wider text-income font-medium">Receitas</span>
              <p className="text-base font-bold text-income">{formatCurrency(totalIncome)}</p>
              <span className={`text-[10px] ${incomeChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {incomeChange >= 0 ? '↑' : '↓'} {Math.abs(incomeChange)}% vs Abr
              </span>
            </div>
            <div className="bg-expense/10 rounded-lg p-2.5 border border-expense/20">
              <span className="text-[10px] uppercase tracking-wider text-expense font-medium">Despesas</span>
              <p className="text-base font-bold text-expense">{formatCurrency(totalExpenses)}</p>
              <span className={`text-[10px] ${expenseChange <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {expenseChange > 0 ? '↑' : '↓'} {Math.abs(expenseChange)}% vs Abr
              </span>
            </div>
          </div>

          {/* Grouped Bar Visualization for Historical Tracking */}
          <div className="px-4 py-2">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#8696a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8696a0', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', color: '#8696a0' }} />
                <Bar dataKey="Receitas" fill="#00a884" radius={[3, 3, 0, 0]} maxBarSize={24} />
                <Bar dataKey="Despesas" fill="#f97316" radius={[3, 3, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Per-Category Trend Breakdown */}
          <div className="px-4 pb-2">
            <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-2">Despesas por categoria</p>
            <div className="space-y-1.5">
              {categoryComparison.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-1 px-2 rounded bg-white/5">
                  <span className="text-xs text-text-secondary">{c.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-primary">{formatCurrency(c.current)}</span>
                    {c.previous > 0 && (
                      <span className={`text-[10px] font-bold ${c.change > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {c.change > 0 ? '↑' : '↓'}{Math.abs(c.change)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Net Liquid Balance Footer */}
          <div className="px-4 pb-4 pt-1">
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
              <span className="text-xs text-text-secondary">Saldo líquido</span>
              <span className={`text-sm font-bold ${totalIncome - totalExpenses >= 0 ? 'text-income' : 'text-danger'}`}>
                {formatCurrency(totalIncome - totalExpenses)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
