const Contribution = require('../models/Contribution');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { contributionPointsForType } = require('../services/activityService');

// GET /api/contributions (admin only)
exports.getContributions = catchAsync(async (req, res) => {
  const contributions = await Contribution.find()
    .populate('member', 'name email')
    .populate('loggedBy', 'name')
    .sort({ date: -1 });
  res.status(200).json({ success: true, data: contributions });
});

// POST /api/contributions (admin only)
exports.createContribution = catchAsync(async (req, res, next) => {
  const { member, title, description, category, date, contributionType } = req.body;
  if (!member || !title || !category || !contributionType) {
    return next(new AppError('member, title, category and contributionType are required.', 400));
  }
  if (!['MINOR', 'MAJOR'].includes(contributionType)) {
    return next(new AppError('contributionType must be MINOR or MAJOR.', 400));
  }

  // Backend determines points -- the client can only pick MINOR or MAJOR.
  const points = contributionPointsForType(contributionType);

  const contribution = await Contribution.create({
    member,
    title,
    description,
    category,
    date: date || Date.now(),
    points,
    loggedBy: req.user._id,
  });

  res.status(201).json({ success: true, data: contribution });
});

// GET /api/contributions/member/:memberId
// Admins can view any member's contributions. Members may only view their own.
exports.getContributionsForMember = catchAsync(async (req, res, next) => {
  if (req.user.role === 'MEMBER' && req.user._id.toString() !== req.params.memberId) {
    return next(new AppError('You can only view your own contributions.', 403));
  }

  const contributions = await Contribution.find({ member: req.params.memberId })
    .populate('loggedBy', 'name')
    .sort({ date: -1 });
  res.status(200).json({ success: true, data: contributions });
});
