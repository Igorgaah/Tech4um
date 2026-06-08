export default function TypingIndicator({ typingUsers = [] }) {
  if (typingUsers.length === 0) return null;

  const names =
    typingUsers.length === 1
      ? typingUsers[0].username
      : typingUsers.length === 2
      ? `${typingUsers[0].username} e ${typingUsers[1].username}`
      : `${typingUsers[0].username} e mais ${typingUsers.length - 1}`;

  const verb = typingUsers.length === 1 ? 'está' : 'estão';

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-dark-300 animate-fade-in">
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-dark-300 rounded-full animate-bounce-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </span>
      <span>
        <strong className="text-dark-200">{names}</strong> {verb} digitando...
      </span>
    </div>
  );
}
