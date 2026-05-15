import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../hooks/useChat';

// ── Custom Tooltip for Debt Visualization ──
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel px-3 py-2 rounded-lg border border-danger/30 shadow-xl text-xs">
        <p className="font-bold text-text-primary mb-1">Mês {label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
}

export default function WarningCard() {
  // Simulate a R$ 1000 debt over 12 months
  // Card at 14% month, Loan at 3% month
  const initialDebt = 1000;
  const cardRate = 1.14;
  const loanRate = 1.03;

  const data = Array.from({ length: 12 }, (_, i) => {
    return {
      month: i + 1,
      Cartão: Math.round(initialDebt * Math.pow(cardRate, i + 1)),
      Empréstimo: Math.round(initialDebt * Math.pow(loanRate, i + 1)),
    };
  });

  const finalCardCost = data[11]['Cartão'];
  const finalLoanCost = data[11]['Empréstimo'];
  const totalSavings = finalCardCost - finalLoanCost;

  return (
    <div className="flex justify-start w-full animate-slide-up">
      <div className="max-w-[90%] md:max-w-[70%] w-full">
        <div className="glass-card rounded-lg overflow-hidden border-danger/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          
          <div className="flex items-center gap-2 px-4 pt-3 pb-2 bg-danger/10 border-b border-danger/20">
            <ShieldAlert className="w-4 h-4 text-danger animate-pulse" />
            <h3 className="text-xs font-bold text-danger tracking-wide uppercase">Alerta de Juros Rotativos</h3>
          </div>

          <div className="px-4 py-3">
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              Veja como uma dívida de <strong>R$ 1.000,00</strong> cresce em 12 meses pagando apenas o mínimo do cartão vs. um empréstimo pessoal:
            </p>

            <div className="h-36 w-full mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLoan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00a884" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00a884" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: '#8696a0', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8696a0', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Area type="monotone" dataKey="Cartão" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCard)" />
                  <Area type="monotone" dataKey="Empréstimo" stroke="#00a884" strokeWidth={2} fillOpacity={1} fill="url(#colorLoan)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 bg-danger/5 rounded p-2 border border-danger/10">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                <p className="text-[11px] text-text-primary">
                  Ao trocar a dívida para um empréstimo pessoal de 3% a.m., você economizaria <strong>{formatCurrency(totalSavings)}</strong> em juros no ano.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
