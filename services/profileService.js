const profileModel = require('../models/profileModel');
const userModel = require('../models/userModel');
const { AppError } = require('../utils/errors');
const { serializeProfile } = require('../utils/serializer');

async function getProfile(username, viewer) {
  const profile = await profileModel.getProfileByUsername(username, viewer ? viewer.id : 0);

  if (!profile) {
    throw new AppError(404, 'profile not found');
  }

  return serializeProfile(profile);
}

async function follow(username, currentUser) {
  const targetUser = await userModel.findByUsername(username);

  if (!targetUser) {
    throw new AppError(404, 'profile not found');
  }

  if (targetUser.id === currentUser.id) {
    throw new AppError(400, 'cannot follow yourself');
  }

  await profileModel.followUser(currentUser.id, targetUser.id);
  const profile = await profileModel.getProfileByUsername(username, currentUser.id);
  return serializeProfile(profile);
}

async function unfollow(username, currentUser) {
  const targetUser = await userModel.findByUsername(username);

  if (!targetUser) {
    throw new AppError(404, 'profile not found');
  }

  if (targetUser.id === currentUser.id) {
    throw new AppError(400, 'cannot unfollow yourself');
  }

  await profileModel.unfollowUser(currentUser.id, targetUser.id);
  const profile = await profileModel.getProfileByUsername(username, currentUser.id);
  return serializeProfile(profile);
}

module.exports = {
  getProfile,
  follow,
  unfollow
};