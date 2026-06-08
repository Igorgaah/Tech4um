const forumService = require('../services/forumService');

async function list(req, res, next) {
  try {
    const search = req.query.search || '';
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const { forums, total } = await forumService.listForums({ search, limit, offset });
    res.json({ forums, total, limit, offset });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const forum = await forumService.getForum(parseInt(req.params.id));
    res.json({ forum });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, description } = req.body;
    const forum = await forumService.createForum({
      name,
      description,
      createdBy: req.user.id,
    });
    res.status(201).json({ message: 'Fórum criado com sucesso!', forum });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create };
