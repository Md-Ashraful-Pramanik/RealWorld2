const authService = require('../services/authService');

async function login(req, res) {
  const result = await authService.login(req.body.user || {});
  req.auditUserId = result.auditUserId;
  res.json(result.response);
}

async function register(req, res) {
  const result = await authService.register(req.body.user || {});
  req.auditUserId = result.auditUserId;
  res.status(201).json(result.response);
}

module.exports = {
  login,
  register
};