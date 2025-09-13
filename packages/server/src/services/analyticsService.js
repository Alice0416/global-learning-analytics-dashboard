const dayjs = require('dayjs');
const Event = require('../models/Event');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/** Bulk ingest events: accepts array of events */
async function ingest(events = []) {
  if (!Array.isArray(events)) throw Object.assign(new Error('Body must be an array'), { status: 400 });
  const docs = events.map((e) => ({
    userId: e.userId,
    courseId: e.courseId,
    type: e.type,
    durationSec: e.durationSec || 0,
    score: e.score ?? null,
    ts: e.ts ? new Date(e.ts) : new Date()
  }));
  await Event.insertMany(docs, { ordered: false });
  return { inserted: docs.length };
}

/** KPIs between [from,to] inclusive */
async function kpis({ from, to }) {
  const start = dayjs(from).isValid() ? dayjs(from).toDate() : new Date(0);
  const end = dayjs(to).isValid() ? dayjs(to).toDate() : new Date();

  const match = { ts: { $gte: start, $lte: end } };
  const agg = await Event.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        views: { $sum: { $cond: [{ $eq: ['$type', 'view'] }, 1, 0] } },
        totalWatch: { $sum: { $cond: [{ $eq: ['$type', 'view'] }, '$durationSec', 0] } },
        quizzes: { $sum: { $cond: [{ $eq: ['$type', 'quiz'] }, 1, 0] } },
        completes: { $sum: { $cond: [{ $eq: ['$type', 'complete'] }, 1, 0] } },
        users: { $addToSet: '$userId' }
      }
    }
  ]);

  const usersSet = new Set();
  agg.forEach((g) => (g.users || []).forEach((u) => usersSet.add(String(u))));
  const activeUsers = usersSet.size;

  // completion rate: number of complete events / number of enrollments in period (approx)
  const completes = agg.find((g) => g._id === 'complete')?.completes || 0;
  const enrollmentsCount = await Enrollment.countDocuments({ updatedAt: { $lte: end } });
  const completionRate = enrollmentsCount ? completes / enrollmentsCount : 0;

  const totalWatch = agg.reduce((s, g) => s + (g.totalWatch || 0), 0);
  const viewEvents = agg.reduce((s, g) => s + (g.views || 0), 0);
  const avgWatchTime = viewEvents ? totalWatch / viewEvents : 0;

  // basic retention approximations
  const last7 = await Event.distinct('userId', { ts: { $gte: dayjs(end).subtract(7, 'day').toDate(), $lte: end } });
  const prev7 = await Event.distinct('userId', {
    ts: { $gte: dayjs(end).subtract(14, 'day').toDate(), $lt: dayjs(end).subtract(7, 'day').toDate() }
  });
  const ret7 = last7.length ? last7.filter((u) => prev7.map(String).includes(String(u))).length / last7.length : 0;

  const last30 = await Event.distinct('userId', { ts: { $gte: dayjs(end).subtract(30, 'day').toDate(), $lte: end } });
  const prev30 = await Event.distinct('userId', {
    ts: { $gte: dayjs(end).subtract(60, 'day').toDate(), $lt: dayjs(end).subtract(30, 'day').toDate() }
  });
  const ret30 = last30.length ? last30.filter((u) => prev30.map(String).includes(String(u))).length / last30.length : 0;

  return {
    activeUsers,
    completionRate: Number(completionRate.toFixed(3)),
    avgWatchTime: Number(avgWatchTime.toFixed(2)),
    retention7d: Number(ret7.toFixed(3)),
    retention30d: Number(ret30.toFixed(3))
  };
}

/** Trends for completion_rate or watch_time grouped by bucket */
async function trends({ metric = 'completion_rate', from, to, bucket = 'day' }) {
  const start = dayjs(from).isValid() ? dayjs(from) : dayjs().subtract(30, 'day');
  const end = dayjs(to).isValid() ? dayjs(to) : dayjs();
  let dateFmt = '%Y-%m-%d';
  if (bucket === 'week') dateFmt = '%G-W%V';
  if (bucket === 'month') dateFmt = '%Y-%m';

  const match = { ts: { $gte: start.toDate(), $lte: end.toDate() } };
  const project = {
    date: { $dateToString: { format: dateFmt, date: '$ts' } },
    type: 1,
    durationSec: 1
  };
  const pipeline = [{ $match: match }, { $project: project }];
  const grp = await Event.aggregate(
    pipeline.concat([
      {
        $group: {
          _id: '$date',
          complete: { $sum: { $cond: [{ $eq: ['$type', 'complete'] }, 1, 0] } },
          enroll: { $sum: { $cond: [{ $eq: ['$type', 'quiz'] }, 1, 0] } },
          watchTime: { $sum: { $cond: [{ $eq: ['$type', 'view'] }, '$durationSec', 0] } },
          viewCnt: { $sum: { $cond: [{ $eq: ['$type', 'view'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ])
  );
  const series = grp.map((g) => {
    if (metric === 'watch_time') {
      return { bucket: g._id, value: g.viewCnt ? g.watchTime / g.viewCnt : 0 };
    }
    // completion_rate approximation
    const denom = g.enroll || g.viewCnt || 1;
    return { bucket: g._id, value: g.complete / denom };
  });
  return { metric, bucket, series: series.map((s) => ({ ...s, value: Number(s.value.toFixed(3)) })) };
}

/** Top popular courses by interactions */
async function popular({ top = 10 }) {
  const agg = await Event.aggregate([
    { $group: { _id: '$courseId', interactions: { $sum: 1 }, completes: { $sum: { $cond: [{ $eq: ['$type', 'complete'] }, 1, 0] } } } },
    { $sort: { interactions: -1 } },
    { $limit: Number(top) }
  ]);
  const courses = await Course.find({ _id: { $in: agg.map((a) => a._id) } });
  const courseMap = new Map(courses.map((c) => [String(c._id), c]));
  return agg.map((a) => ({
    course: courseMap.get(String(a._id)),
    interactions: a.interactions,
    completes: a.completes
  }));
}

module.exports = { ingest, kpis, trends, popular };

