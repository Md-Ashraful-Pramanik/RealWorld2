const sanitizeHtml = require('sanitize-html');

const htmlSanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard'
};

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((accumulator, [key, nestedValue]) => {
      if (['password', 'token'].includes(key.toLowerCase())) {
        accumulator[key] = '[REDACTED]';
      } else {
        accumulator[key] = sanitizeValue(nestedValue);
      }
      return accumulator;
    }, {});
  }

  return value;
}

function sanitizePlainText(value) {
  return sanitizeHtml(value, htmlSanitizeOptions).trim();
}

function containsUnsafeHtml(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const normalizedValue = value.trim();

  return /<[^>]+>/i.test(normalizedValue) || /javascript\s*:/i.test(normalizedValue) || /\bon\w+\s*=/i.test(normalizedValue);
}

module.exports = {
  sanitizeValue,
  sanitizePlainText,
  containsUnsafeHtml
};