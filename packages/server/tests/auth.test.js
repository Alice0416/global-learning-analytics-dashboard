const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  await connectDB(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Auth flow', () => {
  test('register -> login -> refresh -> me', async () => {
    const email = 'test@example.com';
    await request(app).post('/api/auth/register').send({ email, password: 'secret123', name: 'Tester' }).expect(201);
    const login = await request(app).post('/api/auth/login').send({ email, password: 'secret123' }).expect(200);
    expect(login.body.ok).toBe(true);
    const { accessToken, refreshToken } = login.body.data;
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
    const me = await request(app).get('/api/users/me').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(me.body.data.email).toBe(email);
    const refreshed = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);
    expect(refreshed.body.data.accessToken).toBeTruthy();
  });
});

