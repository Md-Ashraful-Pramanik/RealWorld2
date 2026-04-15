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

module.exports = {
  sanitizeValue
};