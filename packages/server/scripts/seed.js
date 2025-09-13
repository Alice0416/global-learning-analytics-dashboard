/*
 Seed script to generate users, courses, enrollments, and 5k-20k events.
*/
const seedrandom = require('seedrandom');
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const { env } = require('../src/config/env');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Enrollment = require('../src/models/Enrollment');
const Event = require('../src/models/Event');
const bcrypt = require('bcryptjs');

async function main() {
  const rng = seedrandom('seed-analytics');
  faker.seed(42);
  await connectDB(env.MONGO_URI);
  console.log('Connected to', env.MONGO_URI);

  await Promise.all([User.deleteMany({}), Course.deleteMany({}), Enrollment.deleteMany({}), Event.deleteMany({})]);

  // Courses
  const tags = ['js', 'ts', 'node', 'react', 'db', 'ml', 'ai', 'algo', 'net', 'cloud'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const courses = [];
  for (let i = 0; i < 55; i++) {
    const t = faker.helpers.arrayElements(tags, Math.max(1, Math.floor(rng() * 3)));
    const diff = difficulties[Math.floor(rng() * difficulties.length)];
    courses.push({ code: `C-${i + 1}`, title: faker.lorem.words({ min: 2, max: 4 }), tags: t, difficulty: diff });
  }
  const courseDocs = await Course.insertMany(courses);

  // Users (including 5 admins)
  const users = [];
  for (let i = 0; i < 205; i++) {
    const role = i < 5 ? 'admin' : 'user';
    const passwordHash = await bcrypt.hash('password123', 10);
    users.push({ email: `user${i + 1}@example.com`, name: faker.person.fullName(), role, passwordHash });
  }
  const userDocs = await User.insertMany(users);

  // Enrollments
  const enrolls = [];
  for (const u of userDocs) {
    const enrolledCount = 2 + Math.floor(rng() * 6);
    const picked = faker.helpers.arrayElements(courseDocs, enrolledCount);
    for (const c of picked) {
      const completed = rng() < 0.3;
      enrolls.push({ userId: u._id, courseId: c._id, status: completed ? 'completed' : 'enrolled', progress: completed ? 100 : Math.floor(rng() * 80) });
    }
  }
  const enrollDocs = await Enrollment.insertMany(enrolls);

  // Events
  const totalEvents = 5000 + Math.floor(rng() * 15000);
  const now = Date.now();
  const events = [];
  for (let i = 0; i < totalEvents; i++) {
    const e = enrollDocs[Math.floor(rng() * enrollDocs.length)];
    const ts = new Date(now - Math.floor(rng() * 1000 * 60 * 60 * 24 * 90)); // past 90 days
    const r = rng();
    if (r < 0.7) {
      events.push({ userId: e.userId, courseId: e.courseId, type: 'view', durationSec: Math.floor(rng() * 600), ts });
    } else if (r < 0.9) {
      events.push({ userId: e.userId, courseId: e.courseId, type: 'quiz', score: Math.floor(60 + rng() * 40), ts });
    } else {
      events.push({ userId: e.userId, courseId: e.courseId, type: 'complete', ts });
    }
  }
  await Event.insertMany(events, { ordered: false });

  console.log('Seed completed:', {
    users: userDocs.length,
    courses: courseDocs.length,
    enrollments: enrollDocs.length,
    events: events.length
  });

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

