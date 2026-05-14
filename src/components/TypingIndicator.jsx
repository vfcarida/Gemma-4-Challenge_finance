export default function TypingIndicator() {
  return (
    <div className="flex justify-start w-full animate-fade-in">
      <div className="relative bg-bot-bubble rounded-lg rounded-tl-none bubble-tail-left px-4 py-3 shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
