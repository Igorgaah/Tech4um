import { createContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem('tech4um_token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);
    });

    // Global private message notification
    socket.on('private-notification', ({ from, forumId, content }) => {
      toast(`💬 Mensagem privada de ${from.username}: "${content}"`, {
        duration: 5000,
        style: {
          background: '#4338ca',
          color: '#e0e7ff',
          border: '1px solid #6366f1',
        },
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, user?.id]);

  const joinRoom = useCallback((forumId) => {
    socketRef.current?.emit('join-room', { forumId });
  }, []);

  const leaveRoom = useCallback((forumId) => {
    socketRef.current?.emit('leave-room', { forumId });
  }, []);

  const sendMessage = useCallback((payload) => {
    socketRef.current?.emit('send-message', payload);
  }, []);

  const startTyping = useCallback((forumId) => {
    socketRef.current?.emit('typing-start', { forumId });
  }, []);

  const stopTyping = useCallback((forumId) => {
    socketRef.current?.emit('typing-stop', { forumId });
  }, []);

  const onEvent = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        joinRoom,
        leaveRoom,
        sendMessage,
        startTyping,
        stopTyping,
        onEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
