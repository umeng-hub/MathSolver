'use strict';

const express = require('express');
const { solve } = require('../solver');

const router = express.Router();

/**
 * POST /solve
 *
 * Body: { "expression": "<math expression>" }
 *
 * Success 200:
 *   { "expression": "...", "result": "...", "steps": [...] }
 *
 * Error 400:
 *   { "error": "<message>" }
 */
router.post('/', (req, res) => {
  const { expression } = req.body;

  // Input validation
  if (expression === undefined || expression === null) {
    return res.status(400).json({ error: 'Request body must contain an "expression" field' });
  }

  if (typeof expression !== 'string') {
    return res.status(400).json({ error: '"expression" must be a string' });
  }

  if (expression.trim().length === 0) {
    return res.status(400).json({ error: '"expression" cannot be empty' });
  }

  try {
    const { result, steps } = solve(expression);
    return res.json({ expression: expression.trim(), result, steps });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
