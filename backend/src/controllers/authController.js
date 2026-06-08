const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const { user, token } = await authService.register({ username, email, password });
    res.status(201).json({ message: 'Cadastro realizado com sucesso!', user, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });
    res.json({ message: 'Login realizado com sucesso!', user, token });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  // JWT is stateless — client drops the token
  res.json({ message: 'Logout realizado com sucesso.' });
}

module.exports = { register, login, me, logout };
