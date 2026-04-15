const auditService = require('../services/auditService');

async function getAudits(req, res) {
  const result = await auditService.getAudits(req.user);
  res.json(result);
}

module.exports = {
  getAudits
};