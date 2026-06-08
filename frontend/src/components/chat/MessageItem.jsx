import Avatar from '../common/Avatar';
import { formatMessageTime } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';

export default function MessageItem({ message, onPrivateReply }) {
  const { user } = useAuth();

  const isOwnMessage = message.user_id === user?.id;
  const isPrivate = message.is_private;

  return (
    <div
      className={`
        group flex gap-3 px-4 py-1.5 rounded-lg transition-colors
        message-enter
        ${isPrivate
          ? 'bg-brand-900/20 border-l-2 border-brand-500 ml-2'
          : 'hover:bg-dark-700/40'}
      `}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        <Avatar username={message.username} avatarUrl={message.avatar_url} size="sm" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span
            className={`font-semibold text-sm ${isOwnMessage ? 'text-brand-300' : 'text-white'}`}
          >
            {message.username}
          </span>

          {isPrivate && (
            <span className="inline-flex items-center gap-1 text-xs bg-brand-700/40 text-brand-300 px-1.5 py-0.5 rounded">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              privado
              {message.recipient_username && (
                <span className="text-brand-200">→ {message.recipient_username}</span>
              )}
            </span>
          )}

          <span className="text-xs text-dark-300">{formatMessageTime(message.created_at)}</span>
        </div>

        {/* Message text */}
        <p className={`text-sm mt-0.5 break-words ${isPrivate ? 'text-dark-100' : 'text-dark-100'}`}>
          {message.content}
        </p>
      </div>

      {/* Actions (visible on hover) */}
      {!isOwnMessage && !isPrivate && (
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onPrivateReply?.({ id: message.user_id, username: message.username })}
            className="p-1 rounded text-dark-300 hover:text-brand-400 hover:bg-dark-600 transition-colors"
            title={`Mensagem privada para ${message.username}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
