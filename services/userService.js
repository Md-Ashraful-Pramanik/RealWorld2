const bcrypt = require('bcryptjs');

const userModel = require('../models/userModel');
const { AppError } = require('../utils/errors');
const { serializeUser } = require('../utils/serializer');
const { signToken } = require('../utils/auth');
const {
  assertAllowedFields,
  requireAtLeastOneField,
  optionalNullableString,
  optionalString
} = require('../utils/validation');

async function getCurrentUser(user) {
  const freshUser = await userModel.findById(user.id);
  return serializeUser(freshUser, signToken(freshUser));
}

async function updateCurrentUser(currentUser, updates = {}) {
  const allowedFields = ['email', 'password', 'image', 'bio'];
  assertAllowedFields(updates, allowedFields, 'user');
  requireAtLeastOneField(updates, allowedFields, 'user update');

  const payload = {};

  if (updates.email !== undefined) {
    payload.email = optionalString(updates, 'email', { scope: 'user' }).toLowerCase();
  }

  if (updates.bio !== undefined) {
    payload.bio = optionalNullableString(updates, 'bio', { scope: 'user' });
  }

  if (updates.image !== undefined) {
    payload.image = optionalNullableString(updates, 'image', { scope: 'user' });
  }

  if (updates.password !== undefined) {
    const password = optionalString(updates, 'password', { scope: 'user' });
    payload.password_hash = await bcrypt.hash(password, 10);
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