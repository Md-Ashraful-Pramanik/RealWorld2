const tagService = require('../services/tagService');

async function getTags(req, res) {
  const result = await tagService.getTags();
  res.json(result);
}

module.exports = {
  getTags
};