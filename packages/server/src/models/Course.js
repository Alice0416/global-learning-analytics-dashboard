const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true, index: true },
    title: { type: String, required: true },
    tags: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true
    }
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Course', CourseSchema);

