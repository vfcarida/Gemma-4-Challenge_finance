import { Mic, CheckCheck } from 'lucide-react';

// ── Simple markdown-like bold parser for chat bubbles ──
function renderContent(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function MessageBubble({ message }) {
  const isUser = message.type === 'user';
  const isAudio = message.icon === 'audio';

  return (
    <div
      className={`flex w-full animate-slide-up ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`relative max-w-[85%] md:max-w-[65%] rounded-lg px-3 py-2 shadow-md ${
          isUser
            ? 'bg-user-bubble bubble-tail-right rounded-tr-none'
            : 'bg-bot-bubble bubble-tail-left rounded-tl-none'
        }`}
      >
        {/* Audio waveform visualization (simulated) */}
        {isAudio && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Mic className="w-4 h-4 text-accent" />
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-accent/60"
                  style={{
                    height: `${Math.random() * 16 + 4}px`,
                    opacity: 0.4 + Math.random() * 0.6,
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-text-secondary ml-1">0:08</span>
          </div>
        )}

        {/* Dynamic Text Content */}
        <p className="text-sm leading-relaxed text-text-primary whitespace-pre-line">
          {renderContent(message.content)}
        </p>

        {/* Footer: Timestamp and Message Status */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-text-muted">{message.timestamp}</span>
          {isUser && (
            <CheckCheck className="w-4 h-4 text-accent" />
          )}
        </div>
      </div>
    </div>
  );
}
