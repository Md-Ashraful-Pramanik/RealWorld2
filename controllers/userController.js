const userService = require('../services/userService');
const { requireBodyContainer } = require('../utils/validation');

async function getCurrentUser(req, res) {
  const result = await userService.getCurrentUser(req.user);
  res.json(result);
}

async function updateCurrentUser(req, res) {
  const result = await userService.updateCurrentUser(req.user, requireBodyContainer(req.body, 'user'));
  res.json(result);
}

module.exports = {
  getCurrentUser,
  updateCurrentUser
};