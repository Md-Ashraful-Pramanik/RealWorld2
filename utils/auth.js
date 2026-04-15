const jwt = require('jsonwebtoken');

const config = require('../config/env');
const userModel = require('../models/userModel');
const { AppError } = require('./errors');

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: '7d'
  });
}

function extractToken(headerValue = '') {
  if (!headerValue) {
    return null;
  }

  if (headerValue.startsWith('Token ')) {
    return headerValue.slice(6).trim();
  }

  if (headerValue.startsWith('Bearer ')) {
    return headerValue.slice(7).trim();
  }

  return null;
}

async function attachCurrentUser(req, res, next) {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      req.user = null;
      return next();
    }

    const payload = jwt.verify(token, config.jwtSecret);
    const user = await userModel.findById(payload.sub);
    req.user = user || null;
    return next();
  } catch (error) {
    req.user = null;
    return next();
  }
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return next(new AppError(401, 'authentication required'));
  }

  return next();
}

module.exports = {
  signToken,
  extractToken,
  attachCurrentUser,
  requireAuth
};