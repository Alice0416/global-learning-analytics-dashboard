const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error');
const { env } = require('./config/env');

const app = express();
app.use(cors({ origin: env.CLIENT_URL || true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, status: 'healthy' }));

// Serve OpenAPI YAML statically
app.use('/api/docs', express.static(path.join(__dirname, 'docs')));

// API routes
app.use('/api', routes);

// 404
app.use((req, res) => res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Route not found' } }));

// Error handler
app.use(errorHandler);

module.exports = app;

