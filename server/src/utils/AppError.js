// Custom error class so we can attach an HTTP status code to any error we throw.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
module.exports = AppError;
