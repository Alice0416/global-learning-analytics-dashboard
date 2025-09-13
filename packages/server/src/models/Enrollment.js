const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
    status: { type: String, enum: ['enrolled', 'completed'], default: 'enrolled' },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    lastActiveAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);

