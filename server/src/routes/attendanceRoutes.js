const express = require('express');
const { authenticate, requireAdmin, requireMember } = require('../middleware/auth');
const {
  checkIn,
  getMyAttendance,
  getAttendanceForEvent,
} = require('../controllers/attendanceController');

const router = express.Router();

router.use(authenticate);

router.post('/check-in', requireMember, checkIn);
router.get('/my', requireMember, getMyAttendance);
router.get('/event/:eventId', requireAdmin, getAttendanceForEvent);

module.exports = router;
