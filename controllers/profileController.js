const profileService = require('../services/profileService');

async function getProfile(req, res) {
  const result = await profileService.getProfile(req.params.username, req.user);
  res.json(result);
}

async function followProfile(req, res) {
  const result = await profileService.follow(req.params.username, req.user);
  res.json(result);
}

async function unfollowProfile(req, res) {
  const result = await profileService.unfollow(req.params.username, req.user);
  res.json(result);
}

module.exports = {
  getProfile,
  followProfile,
  unfollowProfile
};