import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../hooks/useChat';

export default function ComparisonCard({ data }) {
  const { category, current, previous, prev2 } = data;
  const pctChange = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
  const increased = pctChange > 0;

  const months = [
    { label: 'Mar', value: prev2 || 0 },
    { label: 'Abr', value: previous },
    { label: 'Mai', value: current },
  ];
  const maxVal = Math.max(...months.map((m) => m.value), 1);

  return (
    <div className="flex justify-start w-full animate-slide-up">
      <div className="max-w-[85%] md:max-w-[65%] w-full">
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">
                📈 Comparativo: {category}
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${increased ? 'bg-red-500/15 text-red-400' : 'bg-green-500/15 text-green-400'}`}>
                {increased ? '↑' : '↓'} {Math.abs(pctChange)}%
              </span>
            </div>
          </div>

          <div className="px-4 py-3 space-y-2">
            {months.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-8 shrink-0">{m.label}</span>
                <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max((m.value / maxVal) * 100, 8)}%`,
                      backgroundColor: i === 2 ? (increased ? '#ef4444' : '#00a884') : '#8696a0',
                      opacity: i === 2 ? 1 : 0.5,
                    }}
                  >
                    <span className="text-[10px] font-bold text-white">{formatCurrency(m.value)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-4 pt-1">
            <div className={`flex items-center gap-2 py-2 px-3 rounded-lg ${increased ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
              {increased ? <TrendingUp className="w-4 h-4 text-red-400" /> : <TrendingDown className="w-4 h-4 text-green-400" />}
              <span className="text-xs text-text-secondary">
                {increased
                  ? `Aumento de ${formatCurrency(current - previous)} em relação ao mês passado`
                  : `Economia de ${formatCurrency(previous - current)} em relação ao mês passado`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
