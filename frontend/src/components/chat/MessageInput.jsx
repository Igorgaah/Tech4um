import { useState, useRef, useCallback, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';

const TYPING_TIMEOUT = 2000;

export default function MessageInput({ forumId, privateRecipient, onClearPrivate, disabled = false }) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const textareaRef = useRef(null);
  const { sendMessage, startTyping, stopTyping } = useSocket();

  // Focus textarea when private recipient changes
  useEffect(() => {
    textareaRef.current?.focus();
  }, [privateRecipient]);

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      startTyping(forumId);
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      stopTyping(forumId);
    }, TYPING_TIMEOUT);
  }, [forumId, startTyping, stopTyping]);

  const handleChange = (e) => {
    setContent(e.target.value);
    handleTyping();
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    setSending(true);
    clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    stopTyping(forumId);

    sendMessage({
      forumId,
      content: trimmed,
      isPrivate: Boolean(privateRecipient),
      recipientId: privateRecipient?.id || null,
    });

    setContent('');
    setSending(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const placeholder = privateRecipient
    ? `Mensagem privada para @${privateRecipient.username}...`
    : 'Enviar mensagem... (Enter para enviar, Shift+Enter para nova linha)';

  return (
    <div className="p-3 border-t border-dark-600">
      {/* Private recipient indicator */}
      {privateRecipient && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-brand-900/30 border border-brand-700/50 rounded-lg text-sm">
          <svg className="w-4 h-4 text-brand-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
          </svg>
          <span className="text-brand-300">
            Mensagem privada para <strong>@{privateRecipient.username}</strong>
          </span>
          <button
            onClick={onClearPrivate}
            className="ml-auto text-brand-400 hover:text-white transition-colors"
            title="Cancelar mensagem privada"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Input area */}
      <div className={`flex items-end gap-2 bg-dark-600 rounded-xl border transition-colors ${
        privateRecipient ? 'border-brand-600/50' : 'border-dark-500'
      } focus-within:border-brand-500`}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-dark-400 resize-none px-4 py-3 text-sm
                     focus:outline-none max-h-[120px] min-h-[44px] leading-relaxed"
          style={{ height: 'auto' }}
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || disabled || sending}
          className="flex-shrink-0 m-2 p-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white
                     transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Enviar (Enter)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
