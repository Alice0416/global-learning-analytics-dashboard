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
  await request(app).post('/api/auth/register').send({ email: 'u1@x.com', password: 'abcdef', name: 'U1' });
  await request(app).post('/api/auth/register').send({ email: 'u2@x.com', password: 'abcdef', name: 'U2' });
  const u1 = await User.findOne({ email: 'u1@x.com' });
  const u2 = await User.findOne({ email: 'u2@x.com' });
  const cs = await Course.create([
    { code: 'JS', title: 'JS', tags: ['js'], difficulty: 'beginner' },
    { code: 'NODE', title: 'Node', tags: ['node', 'js'], difficulty: 'intermediate' },
    { code: 'ML', title: 'ML', tags: ['ml'], difficulty: 'advanced' }
  ]);
  await Enrollment.create([
    { userId: u1._id, courseId: cs[0]._id, status: 'enrolled', progress: 30 },
    { userId: u2._id, courseId: cs[1]._id, status: 'enrolled', progress: 50 }
  ]);
  const now = new Date();
  await Event.create([
    { userId: u2._id, courseId: cs[1]._id, type: 'view', durationSec: 300, ts: now },
    { userId: u2._id, courseId: cs[1]._id, type: 'quiz', score: 90, ts: now },
    { userId: u2._id, courseId: cs[1]._id, type: 'complete', ts: now }
  ]);
  const login = await request(app).post('/api/auth/login').send({ email: 'u1@x.com', password: 'abcdef' });
  token = login.body.data.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test('recommendations return courses with reason', async () => {
  const res = await request(app).get('/api/recommend/me?top=2').set('Authorization', `Bearer ${token}`).expect(200);
  expect(res.body.ok).toBe(true);
  expect(res.body.data.length).toBeGreaterThan(0);
  const item = res.body.data[0];
  expect(item).toHaveProperty('course');
  expect(item).toHaveProperty('reason');
});
