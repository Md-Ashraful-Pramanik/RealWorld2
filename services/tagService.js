const tagModel = require('../models/tagModel');

async function getTags() {
  const tags = await tagModel.listTags();
  return { tags };
}

module.exports = {
  getTags
};