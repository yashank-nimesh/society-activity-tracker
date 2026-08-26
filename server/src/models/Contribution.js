const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['Technical', 'Design', 'Content', 'Management', 'Outreach', 'Event Operations'],
      required: true,
    },
    date: { type: Date, default: Date.now },
    points: { type: Number, required: true },
    loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contribution', contributionSchema);
