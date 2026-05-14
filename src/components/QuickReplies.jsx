export default function QuickReplies({ replies, onSelect }) {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="flex justify-start w-full animate-fade-in pl-2">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide max-w-[90%]">
        {replies.map((text, i) => (
          <button
            key={i}
            onClick={() => onSelect(text)}
            className="shrink-0 px-3 py-1.5 rounded-full border border-accent/40 text-xs font-medium text-accent hover:bg-accent/10 hover:border-accent active:scale-95 transition-all whitespace-nowrap"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
