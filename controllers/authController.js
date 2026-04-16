const authService = require('../services/authService');
const { requireBodyContainer } = require('../utils/validation');

async function login(req, res) {
  const result = await authService.login(requireBodyContainer(req.body, 'user'));
  req.auditUserId = result.auditUserId;
  res.json(result.response);
}

async function register(req, res) {
  const result = await authService.register(requireBodyContainer(req.body, 'user'));
  req.auditUserId = result.auditUserId;
  res.status(201).json(result.response);
}

module.exports = {
  login,
  register
};