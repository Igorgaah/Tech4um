const { Server } = require('socket.io');
const { verifyToken } = require('../config/jwt');
const userRepository = require('../repositories/userRepository');
const messageService = require('../services/messageService');

// In-memory map: forumId -> Map<socketId, { userId, username, avatarUrl }>
const roomUsers = new Map();

function getRoomKey(forumId) {
  return `forum:${forumId}`;
}

function getUsersInRoom(forumId) {
  const room = roomUsers.get(forumId);
  if (!room) return [];
  // Deduplicate by userId (user can have multiple sockets)
  const seen = new Set();
  return Array.from(room.values()).filter((u) => {
    if (seen.has(u.userId)) return false;
    seen.add(u.userId);
    return true;
  });
}

function addUserToRoom(forumId, socketId, userInfo) {
  if (!roomUsers.has(forumId)) roomUsers.set(forumId, new Map());
  roomUsers.get(forumId).set(socketId, userInfo);
}

function removeUserFromRoom(forumId, socketId) {
  const room = roomUsers.get(forumId);
  if (room) {
    room.delete(socketId);
    if (room.size === 0) roomUsers.delete(forumId);
  }
}

function initializeSocket(server) {
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // JWT authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) return next(new Error('Token não fornecido.'));

      const decoded = verifyToken(token);
      const user = await userRepository.findById(decoded.id);
      if (!user) return next(new Error('Usuário não encontrado.'));

      socket.user = { id: user.id, username: user.username, avatarUrl: user.avatar_url };
      next();
    } catch (err) {
      next(new Error('Token inválido.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.username} (${socket.id})`);
    const currentRooms = new Set(); // rooms this socket is in

    // ---- JOIN ROOM ----
    socket.on('join-room', async ({ forumId }) => {
      if (!forumId) return;
      const roomKey = getRoomKey(forumId);

      socket.join(roomKey);
      currentRooms.add(forumId);

      addUserToRoom(forumId, socket.id, {
        userId: socket.user.id,
        username: socket.user.username,
        avatarUrl: socket.user.avatarUrl,
      });

      try {
        // Send message history to the joining user
        const messages = await messageService.getForumMessages(forumId, socket.user.id, {
          limit: 100,
          offset: 0,
        });

        socket.emit('room-joined', {
          forumId,
          messages,
          onlineUsers: getUsersInRoom(forumId),
        });

        // Notify all users in room about updated online list
        io.to(roomKey).emit('online-users-updated', {
          forumId,
          users: getUsersInRoom(forumId),
        });

        // Announce join to the room
        io.to(roomKey).emit('user-joined', {
          forumId,
          user: {
            userId: socket.user.id,
            username: socket.user.username,
            avatarUrl: socket.user.avatarUrl,
          },
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ---- LEAVE ROOM ----
    socket.on('leave-room', ({ forumId }) => {
      if (!forumId) return;
      leaveRoom(socket, io, forumId);
      currentRooms.delete(forumId);
    });

    // ---- SEND MESSAGE ----
    socket.on('send-message', async ({ forumId, content, isPrivate = false, recipientId = null }) => {
      if (!forumId || !content?.trim()) return;

      try {
        const message = await messageService.createMessage({
          forumId,
          userId: socket.user.id,
          content: content.trim(),
          isPrivate,
          recipientId,
        });

        const roomKey = getRoomKey(forumId);

        if (isPrivate && recipientId) {
          // Emit new-message to sender
          socket.emit('new-message', message);

          // Find ALL recipient sockets globally (not just those in this room)
          const allSockets = await io.fetchSockets();
          const recipientSockets = allSockets.filter((s) => s.user?.id === recipientId);

          const notification = {
            from: { id: socket.user.id, username: socket.user.username },
            forumId,
            content: content.substring(0, 50),
          };

          recipientSockets.forEach((rs) => {
            // Show the message in chat only if recipient is already in this room
            if (rs.rooms.has(roomKey)) {
              rs.emit('new-message', message);
            }
            // Always deliver the private notification regardless of current room
            rs.emit('private-notification', notification);
          });
        } else {
          // Broadcast to entire room
          io.to(roomKey).emit('new-message', message);
        }
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ---- TYPING INDICATORS ----
    socket.on('typing-start', ({ forumId }) => {
      if (!forumId) return;
      socket.to(getRoomKey(forumId)).emit('user-typing', {
        forumId,
        userId: socket.user.id,
        username: socket.user.username,
      });
    });

    socket.on('typing-stop', ({ forumId }) => {
      if (!forumId) return;
      socket.to(getRoomKey(forumId)).emit('user-stop-typing', {
        forumId,
        userId: socket.user.id,
        username: socket.user.username,
      });
    });

    // ---- DISCONNECT ----
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.user.username} (${socket.id})`);
      currentRooms.forEach((forumId) => leaveRoom(socket, io, forumId));
    });
  });

  return io;
}

function leaveRoom(socket, io, forumId) {
  const roomKey = getRoomKey(forumId);
  socket.leave(roomKey);
  removeUserFromRoom(forumId, socket.id);

  io.to(roomKey).emit('online-users-updated', {
    forumId,
    users: getUsersInRoom(forumId),
  });

  io.to(roomKey).emit('user-left', {
    forumId,
    user: { userId: socket.user.id, username: socket.user.username },
  });
}

module.exports = { initializeSocket };
