'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const solveRouter = require('./src/routes/solve');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health-check route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/solve', solveRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Only start listening when this file is run directly (not during tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MathSolver server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
