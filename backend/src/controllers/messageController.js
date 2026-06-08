const messageService = require('../services/messageService');

async function getForumMessages(req, res, next) {
  try {
    const forumId = parseInt(req.params.forumId);
    const limit = Math.min(parseInt(req.query.limit) || 100, 200);
    const offset = parseInt(req.query.offset) || 0;

    const messages = await messageService.getForumMessages(forumId, req.user.id, { limit, offset });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
}

async function createMessage(req, res, next) {
  try {
    const forumId = parseInt(req.params.forumId);
    const { content, isPrivate, recipientId } = req.body;

    const message = await messageService.createMessage({
      forumId,
      userId: req.user.id,
      content,
      isPrivate: Boolean(isPrivate),
      recipientId: recipientId ? parseInt(recipientId) : null,
    });

    res.status(201).json({ message: 'Mensagem enviada!', data: message });
  } catch (err) {
    next(err);
  }
}

module.exports = { getForumMessages, createMessage };
