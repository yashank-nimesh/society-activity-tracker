const crypto = require('crypto');
const Event = require('../models/Event');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

function generateCheckInCode() {
  // Simple 6-character alphanumeric code, uppercase for easy typing.
  return crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
}

// GET /api/events
exports.getEvents = catchAsync(async (req, res) => {
  const events = await Event.find().sort({ date: -1 }).populate('createdBy', 'name');
  res.status(200).json({ success: true, data: events });
});

// GET /api/events/:id
exports.getEventById = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name');
  if (!event) return next(new AppError('Event not found.', 404));
  res.status(200).json({ success: true, data: event });
});

// POST /api/events (admin only)
exports.createEvent = catchAsync(async (req, res, next) => {
  const { title, date, startTime, type, checkInStart, checkInEnd } = req.body;
  if (!title || !date || !startTime || !type || !checkInStart || !checkInEnd) {
    return next(new AppError('title, date, startTime, type, checkInStart and checkInEnd are required.', 400));
  }

  let checkInCode = generateCheckInCode();
  // Extremely unlikely collision, but guard anyway since checkInCode is unique.
  let attempts = 0;
  while (await Event.findOne({ checkInCode }) && attempts < 5) {
    checkInCode = generateCheckInCode();
    attempts += 1;
  }

  const event = await Event.create({
    title,
    date,
    startTime,
    type,
    checkInCode,
    checkInStart,
    checkInEnd,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: event });
});
