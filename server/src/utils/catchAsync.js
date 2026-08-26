// Wraps an async controller so we don't need try/catch in every single function.
// Any thrown error / rejected promise gets forwarded to Express's error handler.
module.exports = function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
