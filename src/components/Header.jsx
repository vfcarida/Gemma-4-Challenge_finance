import { useEffect, useState, useRef } from 'react';
import { Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../hooks/useChat';

export default function Header({ balance, previousBalance, onReset }) {
  const [displayBalance, setDisplayBalance] = useState(previousBalance ?? balance);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevBalanceRef = useRef(balance);

  // Animate balance changes
  useEffect(() => {
    if (balance !== prevBalanceRef.current) {
      setIsAnimating(true);
      const start = prevBalanceRef.current;
      const end = balance;
      const duration = 800;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * eased;
        setDisplayBalance(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayBalance(end);
          prevBalanceRef.current = end;
          setTimeout(() => setIsAnimating(false), 300);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [balance]);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-panel-header border-b border-border z-10 shrink-0">
      {/* Left side: Assistant Identity */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-light rounded-full border-2 border-panel-header" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-text-primary tracking-tight">
            GemmaFin
          </h1>
          <p className="text-xs text-accent">online</p>
        </div>
      </div>

      {/* Right side: Interactive Balance & Controls */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
            Saldo Atual
          </p>
          <p
            className={`text-lg font-bold tabular-nums transition-all duration-300 ${
              isAnimating
                ? 'text-accent-light balance-glow scale-110'
                : balance >= 0
                ? 'text-accent'
                : 'text-danger'
            }`}
          >
            {formatCurrency(displayBalance)}
          </p>
        </div>
        <button
          onClick={onReset}
          className="p-2 rounded-full hover:bg-border/50 text-text-secondary hover:text-text-primary transition-colors"
          title="Reiniciar conversa"
          id="reset-button"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
