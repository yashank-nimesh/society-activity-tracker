const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    checkedInAt: { type: Date, default: Date.now },
    attendancePoints: { type: Number, required: true },
  },
  { timestamps: true }
);

// Core anti-duplication mechanism: MongoDB enforces at the database level
// that a (member, event) pair can only exist once, regardless of how many
// simultaneous requests hit the API.
attendanceSchema.index({ member: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
