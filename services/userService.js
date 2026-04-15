const bcrypt = require('bcryptjs');

const userModel = require('../models/userModel');
const { AppError } = require('../utils/errors');
const { serializeUser } = require('../utils/serializer');
const { signToken } = require('../utils/auth');

async function getCurrentUser(user) {
  const freshUser = await userModel.findById(user.id);
  return serializeUser(freshUser, signToken(freshUser));
}

async function updateCurrentUser(currentUser, updates = {}) {
  const payload = {};

  if (updates.email !== undefined) {
    payload.email = updates.email.trim().toLowerCase();
  }

  if (updates.username !== undefined) {
    payload.username = updates.username.trim();
  }

  if (updates.bio !== undefined) {
    payload.bio = updates.bio;
  }

  if (updates.image !== undefined) {
    payload.image = updates.image;
  }

  if (updates.password !== undefined) {
    payload.password_hash = await bcrypt.hash(updates.password, 10);
  }

  const updatedUser = await userModel.updateUser(currentUser.id, payload);

  if (!updatedUser) {
    throw new AppError(404, 'user not found');
  }

  return serializeUser(updatedUser, signToken(updatedUser));
}

module.exports = {
  getCurrentUser,
  updateCurrentUser
};