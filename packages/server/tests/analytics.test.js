const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Event = require('../src/models/Event');
const Enrollment = require('../src/models/Enrollment');

let mongo;
let token;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDB(mongo.getUri());
  // seed minimal deterministic data
  // register users to ensure password hashes are valid for login
  await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'abcdef', name: 'A' });
  await request(app).post('/api/auth/register').send({ email: 'b@b.com', password: 'abcdef', name: 'B' });
  const user = await User.findOne({ email: 'a@b.com' });
  const b = await User.findOne({ email: 'b@b.com' });
  const c1 = await Course.create({ code: 'C-1', title: 'Course 1', tags: ['js'], difficulty: 'beginner' });
  const c2 = await Course.create({ code: 'C-2', title: 'Course 2', tags: ['node'], difficulty: 'intermediate' });
  await Enrollment.create({ userId: user._id, courseId: c1._id, status: 'enrolled', progress: 50 });
  await Enrollment.create({ userId: user._id, courseId: c2._id, status: 'enrolled', progress: 20 });
  const now = new Date();
  await Event.create([
    { userId: user._id, courseId: c1._id, type: 'view', durationSec: 120, ts: now },
    { userId: user._id, courseId: c1._id, type: 'quiz', score: 80, ts: now },
    { userId: user._id, courseId: c1._id, type: 'complete', ts: now },
    { userId: b._id, courseId: c2._id, type: 'view', durationSec: 60, ts: now }
  ]);
  const login = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'abcdef' });
  token = login.body.data.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test('KPIs returns shape', async () => {
  const res = await request(app).get('/api/analytics/kpis').set('Authorization', `Bearer ${token}`).expect(200);
  expect(res.body.ok).toBe(true);
  expect(res.body.data).toHaveProperty('activeUsers');
  expect(res.body.data).toHaveProperty('completionRate');
  expect(res.body.data).toHaveProperty('avgWatchTime');
});

test('Trends returns series', async () => {
  const res = await request(app)
    .get('/api/analytics/trends?metric=watch_time&bucket=day')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  expect(res.body.ok).toBe(true);
  expect(Array.isArray(res.body.data.series)).toBe(true);
});

test('Popular returns top courses', async () => {
  const res = await request(app).get('/api/analytics/popular?top=5').expect(200);
  expect(res.body.ok).toBe(true);
  expect(Array.isArray(res.body.data)).toBe(true);
});
