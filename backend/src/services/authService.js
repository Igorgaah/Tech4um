const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const { generateToken } = require('../config/jwt');
const { createError } = require('../middlewares/errorHandler');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

async function register({ username, email, password }) {
  const existingEmail = await userRepository.findByEmail(email);
  if (existingEmail) {
    throw createError('Este e-mail já está cadastrado.', 409);
  }

  const existingUsername = await userRepository.findByUsername(username);
  if (existingUsername) {
    throw createError('Este nome de usuário já está em uso.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({ username, email, password: hashedPassword });

  const token = generateToken({ id: user.id, username: user.username });
  return { user, token };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw createError('E-mail ou senha incorretos.', 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw createError('E-mail ou senha incorretos.', 401);
  }

  const { password: _pw, ...safeUser } = user;
  const token = generateToken({ id: safeUser.id, username: safeUser.username });
  return { user: safeUser, token };
}

async function getProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw createError('Usuário não encontrado.', 404);
  }
  return user;
}

module.exports = { register, login, getProfile };
