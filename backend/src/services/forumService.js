const forumRepository = require('../repositories/forumRepository');
const { createError } = require('../middlewares/errorHandler');

async function listForums({ search, limit, offset }) {
  const [forums, total] = await Promise.all([
    forumRepository.findAll({ search, limit, offset }),
    forumRepository.count(search),
  ]);
  return { forums, total };
}

async function getForum(id) {
  const forum = await forumRepository.findById(id);
  if (!forum) {
    throw createError('Fórum não encontrado.', 404);
  }
  return forum;
}

async function createForum({ name, description, createdBy }) {
  const existing = await forumRepository.findByName(name);
  if (existing) {
    throw createError('Já existe um fórum com esse nome.', 409);
  }

  const forum = await forumRepository.create({ name, description, createdBy });

  // Return with creator info
  return forumRepository.findById(forum.id);
}

module.exports = { listForums, getForum, createForum };
