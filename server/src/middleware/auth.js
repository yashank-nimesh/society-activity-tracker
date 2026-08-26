const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');

// Verifies the JWT sent in the Authorization header and attaches the
// corresponding user document (minus password) to req.user.
exports.authenticate = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('You are not logged in. Please log in to continue.', 401));
  }
  const token = header.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }
  if (!user.isActive) {
    return next(new AppError('This account has been deactivated.', 403));
  }

  req.user = user;
  next();
});

exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return next(new AppError('This action requires admin privileges.', 403));
  }
  next();
};

exports.requireMember = (req, res, next) => {
  if (req.user.role !== 'MEMBER') {
    return next(new AppError('This action is only available to members.', 403));
  }
  next();
};
