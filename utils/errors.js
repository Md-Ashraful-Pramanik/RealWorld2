class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: 'not found' });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === '23505') {
    return res.status(409).json({
      errors: {
        body: ['resource already exists']
      }
    });
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'internal server error';

  return res.status(statusCode).json({
    errors: {
      body: error.details || [message]
    }
  });
}

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler
};