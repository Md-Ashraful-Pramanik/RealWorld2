const { AppError } = require('./errors');

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function ensurePlainObject(value, message = 'payload must be an object') {
  if (!isPlainObject(value)) {
    throw new AppError(422, 'invalid payload', [message]);
  }

  return value;
}

function requireBodyContainer(body, key) {
  ensurePlainObject(body, 'request body must be an object');

  if (!Object.prototype.hasOwnProperty.call(body, key)) {
    throw new AppError(422, 'invalid payload', [`${key} payload is required`]);
  }

  return ensurePlainObject(body[key], `${key} payload must be an object`);
}

function assertAllowedFields(payload, allowedFields, scope) {
  const invalidFields = Object.keys(payload).filter((field) => !allowedFields.includes(field));

  if (invalidFields.length) {
    throw new AppError(
      422,
      'invalid payload',
      invalidFields.map((field) => `${field} is not allowed in ${scope}`)
    );
  }
}

function requireAtLeastOneField(payload, allowedFields, scope) {
  const presentFields = allowedFields.filter((field) => payload[field] !== undefined);

  if (!presentFields.length) {
    throw new AppError(422, 'invalid payload', [`at least one ${scope} field is required`]);
  }
}

function requireString(payload, field, options = {}) {
  const { allowEmpty = false, scope = 'payload' } = options;
  const value = payload[field];

  if (typeof value !== 'string') {
    throw new AppError(422, 'invalid payload', [`${field} must be a string in ${scope}`]);
  }

  const normalizedValue = value.trim();

  if (!allowEmpty && !normalizedValue) {
    throw new AppError(422, 'invalid payload', [`${field} cannot be empty in ${scope}`]);
  }

  return normalizedValue;
}

function optionalString(payload, field, options = {}) {
  if (payload[field] === undefined) {
    return undefined;
  }

  return requireString(payload, field, options);
}

function optionalNullableString(payload, field, options = {}) {
  if (payload[field] === undefined || payload[field] === null) {
    return payload[field];
  }

  return requireString(payload, field, options);
}

function optionalStringArray(payload, field, options = {}) {
  if (payload[field] === undefined) {
    return undefined;
  }

  if (!Array.isArray(payload[field])) {
    throw new AppError(422, 'invalid payload', [`${field} must be an array in ${options.scope || 'payload'}`]);
  }

  return payload[field].map((value, index) => {
    if (typeof value !== 'string') {
      throw new AppError(
        422,
        'invalid payload',
        [`${field}[${index}] must be a string in ${options.scope || 'payload'}`]
      );
    }

    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new AppError(
        422,
        'invalid payload',
        [`${field}[${index}] cannot be empty in ${options.scope || 'payload'}`]
      );
    }

    return normalizedValue;
  });
}

module.exports = {
  ensurePlainObject,
  requireBodyContainer,
  assertAllowedFields,
  requireAtLeastOneField,
  requireString,
  optionalString,
  optionalNullableString,
  optionalStringArray
};