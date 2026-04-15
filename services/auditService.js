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
  const originalEnd = res.end.bind(res);
  let auditCommitted = false;

  res.end = function patchedEnd(chunk, encoding, callback) {
    if (auditCommitted) {
      return originalEnd(chunk, encoding, callback);
    }

    auditCommitted = true;

    Promise.resolve(
      logAudit({
        userId: req.auditUserId || (req.user ? req.user.id : null),
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        requestBody: sanitizeValue(req.body),
        queryParams: sanitizeValue(req.query)
      })
    ).finally(() => {
      originalEnd(chunk, encoding, callback);
    });

    return res;
  };

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