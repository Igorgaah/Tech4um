const userRepository = require('../repositories/userRepository');

async function search(req, res, next) {
  try {
    const q = req.query.q || '';
    const users = await userRepository.searchByUsername(q, 20);
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const user = await userRepository.findById(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { search, getById };
