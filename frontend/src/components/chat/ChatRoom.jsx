import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import TypingIndicator from './TypingIndicator';

export default function ChatRoom({ forum }) {
  const { user } = useAuth();
  const { joinRoom, leaveRoom, onEvent, isConnected } = useSocket();

  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserList, setShowUserList] = useState(true);
  const [privateRecipient, setPrivateRecipient] = useState(null);

  const typingTimeoutsRef = useRef({});

  const clearTypingUser = useCallback((userId) => {
    clearTimeout(typingTimeoutsRef.current[userId]);
    setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
  }, []);

  useEffect(() => {
    if (!isConnected || !forum?.id) return;

    setLoading(true);
    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);

    joinRoom(forum.id);

    const removeRoomJoined = onEvent('room-joined', ({ messages: msgs, onlineUsers: users }) => {
      setMessages(msgs);
      setOnlineUsers(users);
      setLoading(false);
    });

    const removeNewMessage = onEvent('new-message', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    const removeOnlineUsers = onEvent('online-users-updated', ({ forumId, users }) => {
      if (forumId === forum.id) setOnlineUsers(users);
    });

    const removeTyping = onEvent('user-typing', ({ userId, username, forumId }) => {
      if (forumId !== forum.id || userId === user?.id) return;
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === userId)) return prev;
        return [...prev, { userId, username }];
      });
      clearTimeout(typingTimeoutsRef.current[userId]);
      typingTimeoutsRef.current[userId] = setTimeout(() => clearTypingUser(userId), 3500);
    });

    const removeStopTyping = onEvent('user-stop-typing', ({ userId, forumId }) => {
      if (forumId !== forum.id) return;
      clearTypingUser(userId);
    });

    const removeError = onEvent('error', ({ message }) => {
      console.error('Socket error:', message);
      setLoading(false);
    });

    return () => {
      removeRoomJoined?.();
      removeNewMessage?.();
      removeOnlineUsers?.();
      removeTyping?.();
      removeStopTyping?.();
      removeError?.();
      leaveRoom(forum.id);
    };
  }, [forum?.id, isConnected, user?.id]);

  const handlePrivateReply = useCallback((recipient) => {
    setPrivateRecipient(recipient);
  }, []);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Connection status */}
        {!isConnected && (
          <div className="bg-yellow-600/20 border-b border-yellow-600/30 text-yellow-400 text-xs text-center py-1.5 px-4">
            Reconectando ao servidor em tempo real...
          </div>
        )}

        <MessageList
          messages={messages}
          loading={loading}
          onPrivateReply={handlePrivateReply}
        />

        <TypingIndicator typingUsers={typingUsers} />

        <MessageInput
          forumId={forum.id}
          privateRecipient={privateRecipient}
          onClearPrivate={() => setPrivateRecipient(null)}
          disabled={!isConnected || loading}
        />
      </div>

      {/* User list */}
      <UserList
        users={onlineUsers}
        onPrivateMessage={handlePrivateReply}
        isVisible={showUserList}
        onToggle={() => setShowUserList((v) => !v)}
      />
    </div>
  );
}
