const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { attendancePointsForEventType } = require('../services/activityService');

// POST /api/attendance/check-in (member only)
exports.checkIn = catchAsync(async (req, res, next) => {
  const { code } = req.body;
  if (!code) {
    return next(new AppError('Check-in code is required.', 400));
  }

  const event = await Event.findOne({ checkInCode: code.toUpperCase().trim() });
  if (!event) {
    return next(new AppError('Invalid check-in code.', 400));
  }

  const now = new Date();
  if (now < event.checkInStart || now > event.checkInEnd) {
    return next(new AppError('The check-in window for this event is not currently open.', 400));
  }

  const existing = await Attendance.findOne({ member: req.user._id, event: event._id });
  if (existing) {
    return next(new AppError('You have already checked in to this event.', 409));
  }

  // The backend decides the points, never the client.
  const attendancePoints = attendancePointsForEventType(event.type);

  let attendance;
  try {
    attendance = await Attendance.create({
      member: req.user._id,
      event: event._id,
      attendancePoints,
    });
  } catch (err) {
    // In case of a race condition, the unique index catches it here too.
    if (err.code === 11000) {
      return next(new AppError('You have already checked in to this event.', 409));
    }
    throw err;
  }

  res.status(201).json({ success: true, data: attendance });
});

// GET /api/attendance/my (member only)
exports.getMyAttendance = catchAsync(async (req, res) => {
  const records = await Attendance.find({ member: req.user._id })
    .populate('event')
    .sort({ checkedInAt: -1 });
  res.status(200).json({ success: true, data: records });
});

// GET /api/attendance/event/:eventId (admin only)
exports.getAttendanceForEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) return next(new AppError('Event not found.', 404));

  const records = await Attendance.find({ event: req.params.eventId })
    .populate('member', 'name email department')
    .sort({ checkedInAt: -1 });

  res.status(200).json({ success: true, data: records });
});
