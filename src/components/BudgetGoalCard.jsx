import { formatCurrency } from '../hooks/useChat';

function CircularProgress({ percentage, color }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
      <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
      <circle
        cx="36" cy="36" r={radius} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
        strokeLinecap="round" transform="rotate(-90 36 36)"
        className="transition-all duration-1000 ease-out"
      />
      <text x="36" y="36" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="12" fontWeight="700">
        {percentage}%
      </text>
    </svg>
  );
}

export default function BudgetGoalCard() {
  const goals = [
    { category: 'Mercado', limit: 70, spent: 80, icon: '🛒' },
    { category: 'Beleza', limit: 40, spent: 50, icon: '💇' },
    { category: 'Transporte', limit: 60, spent: 0, icon: '🚌' },
    { category: 'Gás', limit: 35, spent: 0, icon: '🔥' },
  ];

  return (
    <div className="flex justify-start w-full animate-slide-up">
      <div className="max-w-[85%] md:max-w-[65%] w-full">
        <div className="glass-card rounded-lg overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h3 className="text-sm font-semibold text-text-primary">🎯 Metas de Orçamento — Maio</h3>
            <p className="text-[10px] text-text-muted mt-0.5">Baseado no seu histórico dos últimos 3 meses</p>
          </div>

          <div className="px-4 py-2 space-y-3">
            {goals.map((g, i) => {
              const pct = Math.min(Math.round((g.spent / g.limit) * 100), 100);
              const over = g.spent > g.limit;
              const color = over ? '#ef4444' : pct > 80 ? '#f97316' : '#00a884';

              return (
                <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white/5">
                  <CircularProgress percentage={g.spent > 0 ? pct : 0} color={color} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-primary">{g.icon} {g.category}</span>
                      {over && <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">ACIMA</span>}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-text-secondary">
                        {g.spent > 0 ? `${formatCurrency(g.spent)} de ${formatCurrency(g.limit)}` : `Meta: ${formatCurrency(g.limit)}`}
                      </span>
                      {g.spent > 0 && over && (
                        <span className="text-[10px] text-red-400">+{formatCurrency(g.spent - g.limit)} acima</span>
                      )}
                      {g.spent > 0 && !over && (
                        <span className="text-[10px] text-green-400">Resta {formatCurrency(g.limit - g.spent)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 pb-4 pt-1">
            <p className="text-[10px] text-text-muted text-center">
              💡 Metas calculadas automaticamente pelo Gemma 4 baseado no seu perfil
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
