const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Event = require('../models/Event');

/**
 * Build implicit preference score per user-course:
 * - view: +min(duration/600, 1)
 * - quiz: +score/100
 * - complete: +1.5
 */
async function buildUserCourseMatrix(userIds, courseIds) {
  const courseIndex = new Map(courseIds.map((c, idx) => [String(c), idx]));
  const mat = new Map(); // userId -> Float64Array
  const events = await Event.find({ userId: { $in: userIds }, courseId: { $in: courseIds } });
  for (const ev of events) {
    const u = String(ev.userId);
    const ci = courseIndex.get(String(ev.courseId));
    if (ci === undefined) continue;
    if (!mat.has(u)) mat.set(u, new Float64Array(courseIds.length));
    const row = mat.get(u);
    let inc = 0;
    if (ev.type === 'view') inc += Math.min((ev.durationSec || 0) / 600, 1);
    if (ev.type === 'quiz') inc += (ev.score || 0) / 100;
    if (ev.type === 'complete') inc += 1.5;
    row[ci] += inc;
  }
  return { mat, courseIndex };
}

function cosine(a, b) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / Math.sqrt(na * nb);
}

async function topTagsForUser(userId) {
  const enrolls = await Enrollment.find({ userId });
  const courseIds = enrolls.map((e) => e.courseId);
  const courses = await Course.find({ _id: { $in: courseIds } });
  const freq = new Map();
  for (const c of courses) for (const t of c.tags || []) freq.set(t, (freq.get(t) || 0) + 1);
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map((e) => e[0]);
}

/**
 * Get Top-N recommendations for user with simple user-based CF.
 * Returns [{ course, reason }]
 */
async function getRecommendationsForUser(userId, topN = 10) {
  const allCourses = await Course.find();
  const allUsersEnrolls = await Enrollment.find();
  const userIds = [...new Set(allUsersEnrolls.map((e) => String(e.userId)))];
  const courseIds = allCourses.map((c) => String(c._id));
  const { mat } = await buildUserCourseMatrix(userIds, courseIds);
  const selfVec = mat.get(String(userId)) || new Float64Array(courseIds.length);

  // compute similarity to others
  const sim = [];
  for (const [uid, vec] of mat.entries()) {
    if (uid === String(userId)) continue;
    sim.push({ uid, s: cosine(selfVec, vec) });
  }
  sim.sort((a, b) => b.s - a.s);
  const topSims = sim.slice(0, 20).filter((x) => x.s > 0);

  // score courses by weighted sum of similar users' preferences
  const scores = new Float64Array(courseIds.length);
  for (const { uid, s } of topSims) {
    const v = mat.get(uid);
    if (!v) continue;
    for (let i = 0; i < v.length; i++) scores[i] += v[i] * s;
  }

  // exclude already completed/enrolled heavily interacted
  const myEnrolls = await Enrollment.find({ userId });
  const myCourseSet = new Set(myEnrolls.map((e) => String(e.courseId)));

  // tag-based boost
  const myTags = await topTagsForUser(userId);
  const tagBoost = new Map();
  for (let i = 0; i < courseIds.length; i++) {
    const c = allCourses[i];
    const overlap = (c.tags || []).filter((t) => myTags.includes(t)).length;
    if (overlap > 0) tagBoost.set(i, 0.2 * overlap);
  }

  const ranked = courseIds
    .map((cid, idx) => ({ idx, cid, base: scores[idx], boost: tagBoost.get(idx) || 0 }))
    .filter((x) => !myCourseSet.has(x.cid))
    .sort((a, b) => b.base + b.boost - (a.base + a.boost))
    .slice(0, topN);

  // craft reasons
  const results = [];
  for (const r of ranked) {
    const course = allCourses[r.idx];
    // estimate similar users completion ratio for this course
    const simUsers = topSims.map((s) => s.uid);
    const comp = await Event.countDocuments({ courseId: course._id, type: 'complete', userId: { $in: simUsers } });
    const total = await Event.countDocuments({ courseId: course._id, userId: { $in: simUsers } });
    const ratio = total ? Math.min(1, comp / total) : 0;
    let reason = '';
    if (ratio > 0) reason = `相似用户 ${(ratio * 100).toFixed(0)}% 完成该课`;
    const tagMatch = (course.tags || []).filter((t) => myTags.includes(t));
    if (tagMatch.length) {
      const tagText = `与你常看的 tag 匹配：${tagMatch.join(',')}`;
      reason = reason ? `${reason}；${tagText}` : tagText;
    }
    if (!reason) reason = '基于你的学习行为推荐';
    results.push({ course, reason });
  }
  return results;
}

module.exports = { getRecommendationsForUser };

