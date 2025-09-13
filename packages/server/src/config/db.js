const mongoose = require('mongoose');
const { env } = require('./env');

async function connectDB(uri = env.MONGO_URI) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000
  });
  return mongoose.connection;
}

module.exports = { connectDB };

