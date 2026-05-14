import MessageBubble from './MessageBubble';
import ThinkingBlock from './ThinkingBlock';
import MiniReportCard from './MiniReportCard';
import ImageBubble from './ImageBubble';

export default function MessageFeed({
  messages,
  isThinking,
  thinkingSteps,
  income,
  expenses,
  scrollRef,
}) {
  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto chat-bg-pattern px-3 py-4 space-y-2"
      id="message-feed"
    >
      {/* Date divider */}
      <div className="flex justify-center mb-2">
        <span className="px-3 py-1 rounded-lg bg-panel-header/80 text-[11px] text-text-muted shadow-sm">
          Hoje
        </span>
      </div>

      {messages.map((msg) => {
        if (msg.content === '__MINI_REPORT__') {
          return (
            <MiniReportCard
              key={msg.id}
              income={income}
              expenses={expenses}
            />
          );
        }
        if (msg.content === '__BANK_STATEMENT_IMAGE__') {
          return <ImageBubble key={msg.id} timestamp={msg.timestamp} />;
        }
        return <MessageBubble key={msg.id} message={msg} />;
      })}

      {/* Thinking block */}
      {isThinking && (
        <ThinkingBlock steps={thinkingSteps} isComplete={false} />
      )}

      {/* Bottom spacer for scroll */}
      <div className="h-1" />
    </div>
  );
}
