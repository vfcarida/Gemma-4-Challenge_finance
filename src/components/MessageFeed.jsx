import MessageBubble from './MessageBubble';
import ThinkingBlock from './ThinkingBlock';
import MiniReportCard from './MiniReportCard';
import FullReportCard from './FullReportCard';
import ComparisonCard from './ComparisonCard';
import BudgetGoalCard from './BudgetGoalCard';
import ImageBubble from './ImageBubble';
import TypingIndicator from './TypingIndicator';
import QuickReplies from './QuickReplies';

export default function MessageFeed({
  messages,
  isThinking,
  thinkingSteps,
  isTyping,
  income,
  expenses,
  historicalData,
  scrollRef,
  onQuickReply,
}) {
  const lastMsgIndex = messages.length - 1;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto chat-bg-pattern px-3 py-4 space-y-2" id="message-feed">
      <div className="flex justify-center mb-2">
        <span className="px-3 py-1 rounded-lg bg-panel-header/80 text-[11px] text-text-muted shadow-sm">Hoje</span>
      </div>

      {messages.map((msg, idx) => {
        // Special content cards
        if (msg.content === '__MINI_REPORT__') {
          return <MiniReportCard key={msg.id} income={income} expenses={expenses} />;
        }
        if (msg.content === '__BANK_STATEMENT_IMAGE__') {
          return <ImageBubble key={msg.id} timestamp={msg.timestamp} />;
        }

        // JSON special content from smart engine
        if (msg.icon === 'special' && msg._special) {
          const data = msg._special;
          if (data.type === '__FULL_REPORT__') {
            return <FullReportCard key={msg.id} income={income} expenses={expenses} historicalData={historicalData} />;
          }
          if (data.type === '__COMPARISON__') {
            return <ComparisonCard key={msg.id} data={data} />;
          }
          if (data.type === '__BUDGET_GOAL__') {
            return <BudgetGoalCard key={msg.id} />;
          }
          return null;
        }

        const isLastBotMsg = msg.type === 'bot' && idx === lastMsgIndex;
        const showReplies = isLastBotMsg && msg.suggestedReplies && !isThinking && !isTyping;

        return (
          <div key={msg.id}>
            <MessageBubble message={msg} />
            {showReplies && (
              <div className="mt-1.5">
                <QuickReplies replies={msg.suggestedReplies} onSelect={onQuickReply} />
              </div>
            )}
          </div>
        );
      })}

      {isThinking && <ThinkingBlock steps={thinkingSteps} isComplete={false} />}
      {isTyping && <TypingIndicator />}
      <div className="h-1" />
    </div>
  );
}
