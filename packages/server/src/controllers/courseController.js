const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

async function list(req, res, next) {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: courses });
  } catch (e) {
    next(e);
  }
}

async function detail(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Course not found' } });
    res.json({ ok: true, data: course });
  } catch (e) {
    next(e);
  }
}

async function enroll(req, res, next) {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Course not found' } });
    const doc = await Enrollment.findOneAndUpdate(
      { userId: req.user.id, courseId },
      { $setOnInsert: { status: 'enrolled', progress: 0, lastActiveAt: new Date() } },
      { new: true, upsert: true }
    );
    res.json({ ok: true, data: doc });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, detail, enroll };

