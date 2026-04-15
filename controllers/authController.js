const authService = require('../services/authService');

async function login(req, res) {
  const result = await authService.login(req.body.user || {});
  res.json(result);
}

async function register(req, res) {
  const result = await authService.register(req.body.user || {});
  res.status(201).json(result);
}

module.exports = {
  login,
  register
};