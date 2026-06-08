const messageRepository = require('../repositories/messageRepository');
const forumRepository = require('../repositories/forumRepository');
const userRepository = require('../repositories/userRepository');
const { createError } = require('../middlewares/errorHandler');

async function getForumMessages(forumId, userId, { limit = 100, offset = 0 } = {}) {
  const forum = await forumRepository.findById(forumId);
  if (!forum) {
    throw createError('Fórum não encontrado.', 404);
  }

  const messages = await messageRepository.findByForum(forumId, { limit, offset, userId });
  return messages;
}

async function createMessage({ forumId, userId, content, isPrivate = false, recipientId = null }) {
  const forum = await forumRepository.findById(forumId);
  if (!forum) {
    throw createError('Fórum não encontrado.', 404);
  }

  if (isPrivate) {
    if (!recipientId) {
      throw createError('Destinatário obrigatório para mensagem privada.', 400);
    }
    const recipient = await userRepository.findById(recipientId);
    if (!recipient) {
      throw createError('Destinatário não encontrado.', 404);
    }
    if (recipientId === userId) {
      throw createError('Você não pode enviar mensagem privada para si mesmo.', 400);
    }
  }

  const message = await messageRepository.create({
    forumId,
    userId,
    content: content.trim(),
    isPrivate,
    recipientId,
  });

  // Return full message with user info
  return messageRepository.findById(message.id);
}

module.exports = { getForumMessages, createMessage };
