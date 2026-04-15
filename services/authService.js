const bcrypt = require('bcryptjs');

const userModel = require('../models/userModel');
const { AppError } = require('../utils/errors');
const { serializeUser } = require('../utils/serializer');
const { signToken } = require('../utils/auth');

function requireFields(payload, fields) {
  const missing = fields.filter((field) => !payload[field]);
  if (missing.length) {
    throw new AppError(422, 'missing required fields', missing.map((field) => `${field} is required`));
  }
}

async function login(userPayload = {}) {
  requireFields(userPayload, ['email', 'password']);

  const user = await userModel.findByEmail(userPayload.email.trim().toLowerCase());
  if (!user) {
    throw new AppError(401, 'invalid credentials');
  }

  const passwordMatches = await bcrypt.compare(userPayload.password, user.password_hash);
  if (!passwordMatches) {
    throw new AppError(401, 'invalid credentials');
  }

  return {
    response: serializeUser(user, signToken(user)),
    auditUserId: user.id
  };
}

async function register(userPayload = {}) {
  requireFields(userPayload, ['username', 'email', 'password']);

  const passwordHash = await bcrypt.hash(userPayload.password, 10);
  const user = await userModel.createUser({
    username: userPayload.username.trim(),
    email: userPayload.email.trim().toLowerCase(),
    passwordHash
  });

  return {
    response: serializeUser(user, signToken(user)),
    auditUserId: user.id
  };
}

module.exports = {
  login,
  register
};