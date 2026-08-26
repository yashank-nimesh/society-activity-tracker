const bcrypt = require('bcryptjs');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { computeMemberActivity } = require('../services/activityService');

// GET /api/members  (admin only) - list/search/filter
exports.getMembers = catchAsync(async (req, res) => {
  const { search, department, status } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (department) filter.department = department;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;

  const members = await User.find(filter).sort({ name: 1 });
  res.status(200).json({ success: true, data: members });
});

// GET /api/members/:id
exports.getMemberById = catchAsync(async (req, res, next) => {
  const member = await User.findById(req.params.id);
  if (!member) return next(new AppError('Member not found.', 404));

  const activity = await computeMemberActivity(member._id);
  res.status(200).json({ success: true, data: { ...member.toObject(), activity } });
});

// POST /api/members (admin only)
exports.createMember = catchAsync(async (req, res, next) => {
  const { name, email, password, department, position, joiningDate, role } = req.body;
  if (!name || !email || !password) {
    return next(new AppError('Name, email and password are required.', 400));
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const member = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    department,
    position,
    joiningDate,
    role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
  });

  const safe = member.toObject();
  delete safe.passwordHash;

  res.status(201).json({ success: true, data: safe });
});

// PATCH /api/members/:id/status (admin only)
exports.setMemberStatus = catchAsync(async (req, res, next) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    return next(new AppError('isActive (boolean) is required.', 400));
  }

  const member = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true, runValidators: true }
  );
  if (!member) return next(new AppError('Member not found.', 404));

  res.status(200).json({ success: true, data: member });
});

// GET /api/members/:id/activity
exports.getMemberActivity = catchAsync(async (req, res, next) => {
  const member = await User.findById(req.params.id);
  if (!member) return next(new AppError('Member not found.', 404));

  const activity = await computeMemberActivity(member._id);
  res.status(200).json({ success: true, data: activity });
});

// GET /api/members/me/activity (any authenticated user, own data only)
exports.getMyActivity = catchAsync(async (req, res) => {
  const activity = await computeMemberActivity(req.user._id);
  res.status(200).json({ success: true, data: activity });
});
