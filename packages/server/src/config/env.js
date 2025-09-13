const dotenv = require('dotenv');
dotenv.config({ path: process.env.DOTENV_CONFIG || undefined });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 8080),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/analyticsdb',
  JWT_SECRET: process.env.JWT_SECRET || 'devsecret_change_me',
  ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL || '15m',
  REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};

module.exports = { env };

