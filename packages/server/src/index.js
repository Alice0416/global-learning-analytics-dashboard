const { connectDB } = require('./config/db');
const { env } = require('./config/env');
const app = require('./app');

async function start() {
  await connectDB();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://0.0.0.0:${env.PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});

