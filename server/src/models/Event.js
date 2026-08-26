const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    type: {
      type: String,
      enum: ['Weekly Meeting', 'Orientation', 'Workshop', 'Project Meeting', 'Event'],
      required: true,
    },
    checkInCode: { type: String, required: true, unique: true },
    checkInStart: { type: Date, required: true },
    checkInEnd: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
