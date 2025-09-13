const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
    type: { type: String, enum: ['view', 'quiz', 'complete'], required: true },
    durationSec: { type: Number, min: 0, default: 0 },
    score: { type: Number, min: 0, max: 100, default: null },
    ts: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

EventSchema.index({ userId: 1, courseId: 1, ts: -1 });

module.exports = mongoose.model('Event', EventSchema);

