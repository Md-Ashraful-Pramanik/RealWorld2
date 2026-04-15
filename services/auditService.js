const auditModel = require('../models/auditModel');
const { sanitizeValue } = require('../utils/sanitize');

async function logAudit(entry) {
  try {
    await auditModel.createAudit(entry);
  } catch (error) {
    console.error('Audit logging failed:', error.message);
  }
}

function auditTrail(req, res, next) {
  res.on('finish', () => {
    void logAudit({
      userId: req.user ? req.user.id : null,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      requestBody: sanitizeValue(req.body),
      queryParams: sanitizeValue(req.query)
    });
  });

  next();
}

async function getAudits(user) {
  const audits = await auditModel.listAuditsByUser(user.id);
  return { audits };
}

module.exports = {
  auditTrail,
  getAudits,
  logAudit
};