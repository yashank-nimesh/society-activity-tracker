const AppError = require('../utils/AppError');

// Centralized error handler. Every error thrown/forwarded via next(err)
// anywhere in the app ends up here, so error formatting stays consistent
// and we never leak stack traces to the client.
module.exports = function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on the server.';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field "${err.path}".`;
  }

  // Duplicate key error (e.g. duplicate attendance, duplicate email/checkInCode)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {}).join(', ');
    if (err.keyPattern && err.keyPattern.member && err.keyPattern.event) {
      message = 'You have already checked in to this event.';
    } else {
      message = `Duplicate value for field: ${field}.`;
    }
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
