import { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Zap } from 'lucide-react';

export default function ThinkingBlock({ steps, isComplete }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex justify-start w-full animate-slide-up">
      <div className="max-w-[85%] md:max-w-[65%] w-full">
        <div className="glass-card rounded-lg overflow-hidden">
          {/* Header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            id="thinking-toggle"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Brain className="w-5 h-5 text-accent" />
                {!isComplete && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-light rounded-full animate-ping" />
                )}
              </div>
              <span className="text-sm font-medium text-accent">
                {isComplete
                  ? '🧠 Gemma 4 processou'
                  : '🧠 Gemma 4 está pensando...'}
              </span>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-text-secondary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-secondary" />
            )}
          </button>

          {/* Steps */}
          {isExpanded && (
            <div className="px-4 pb-3 space-y-1.5">
              {/* Mode indicator */}
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-yellow-500/80">
                  {'<|think|>'} modo ativado
                </span>
              </div>

              {steps.map((step, i) => (
                <div
                  key={i}
                  className="animate-think-line flex items-start gap-2 py-1 px-2 rounded bg-thinking-bg/50"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="text-sm shrink-0">{step.icon}</span>
                  <span className="text-xs font-mono text-text-secondary leading-relaxed">
                    {step.text}
                  </span>
                </div>
              ))}

              {/* Loading indicator when not complete */}
              {!isComplete && (
                <div className="flex items-center gap-2 px-2 py-1">
                  <div className="flex gap-1">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
