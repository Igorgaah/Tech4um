import { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import { groupMessagesByDate } from '../../utils/helpers';
import Loader from '../common/Loader';

export default function MessageList({ messages = [], loading = false, onPrivateReply }) {
  const bottomRef = useRef(null);
  const listRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const isNearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 100;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader size="lg" text="Carregando mensagens..." />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
        <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center">
          <svg className="w-8 h-8 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-medium">Nenhuma mensagem ainda</p>
          <p className="text-dark-300 text-sm mt-1">Seja o primeiro a enviar uma mensagem!</p>
        </div>
      </div>
    );
  }

  const groups = groupMessagesByDate(messages);

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto py-2 space-y-0.5"
    >
      {groups.map((item) => {
        if (item.type === 'date') {
          return (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 h-px bg-dark-600" />
              <span className="text-xs text-dark-300 font-medium px-2 py-0.5 bg-dark-700 rounded-full">
                {item.label}
              </span>
              <div className="flex-1 h-px bg-dark-600" />
            </div>
          );
        }
        return (
          <MessageItem
            key={item.id}
            message={item}
            onPrivateReply={onPrivateReply}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
