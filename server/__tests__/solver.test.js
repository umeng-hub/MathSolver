'use strict';

const request = require('supertest');
const app = require('../server');
const { solve, generateSteps, categorise } = require('../src/solver');

// ─── Unit tests: solver.js ───────────────────────────────────────────────────

describe('categorise()', () => {
  test('identifies addition/subtraction', () => {
    expect(categorise('3 + 4')).toBe('addition_subtraction');
    expect(categorise('10 - 6')).toBe('addition_subtraction');
  });

  test('identifies multiplication/division', () => {
    expect(categorise('3 * 4')).toBe('multiplication_division');
    expect(categorise('10 / 2')).toBe('multiplication_division');
  });

  test('identifies exponentiation', () => {
    expect(categorise('2^10')).toBe('exponentiation');
  });

  test('identifies function expressions', () => {
    expect(categorise('sqrt(16)')).toBe('function');
    expect(categorise('sin(0)')).toBe('function');
    expect(categorise('log(100)')).toBe('function');
  });

  test('identifies algebraic expressions', () => {
    expect(categorise('2*x + 3')).toBe('algebraic');
  });
});

describe('solve()', () => {
  // Basic arithmetic
  test('2 + 2 = 4', () => {
    const { result } = solve('2 + 2');
    expect(result).toBe('4');
  });

  test('10 - 3 = 7', () => {
    const { result } = solve('10 - 3');
    expect(result).toBe('7');
  });

  test('6 * 7 = 42', () => {
    const { result } = solve('6 * 7');
    expect(result).toBe('42');
  });

  test('10 / 2 = 5', () => {
    const { result } = solve('10 / 2');
    expect(result).toBe('5');
  });

  test('2 ^ 8 = 256', () => {
    const { result } = solve('2 ^ 8');
    expect(result).toBe('256');
  });

  // Math functions
  test('sqrt(144) = 12', () => {
    const { result } = solve('sqrt(144)');
    expect(result).toBe('12');
  });

  test('sqrt(2) returns irrational approximation', () => {
    const { result } = solve('sqrt(2)');
    expect(Number(result)).toBeCloseTo(1.4142135, 5);
  });

  test('sin(0) = 0', () => {
    const { result } = solve('sin(0)');
    expect(result).toBe('0');
  });

  test('cos(0) = 1', () => {
    const { result } = solve('cos(0)');
    expect(result).toBe('1');
  });

  test('log(1) = 0', () => {
    const { result } = solve('log(1)');
    expect(result).toBe('0');
  });

  test('abs(-5) = 5', () => {
    const { result } = solve('abs(-5)');
    expect(result).toBe('5');
  });

  // Order of operations
  test('2 + 3 * 4 = 14', () => {
    const { result } = solve('2 + 3 * 4');
    expect(result).toBe('14');
  });

  test('(2 + 3) * 4 = 20', () => {
    const { result } = solve('(2 + 3) * 4');
    expect(result).toBe('20');
  });

  // Steps array
  test('returns an array of steps', () => {
    const { steps } = solve('5 + 3');
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThanOrEqual(2);
  });

  test('each step has step, description, and expression', () => {
    const { steps } = solve('4 * 3');
    steps.forEach(s => {
      expect(s).toHaveProperty('step');
      expect(s).toHaveProperty('description');
      expect(s).toHaveProperty('expression');
    });
  });

  test('step numbers are sequential starting from 1', () => {
    const { steps } = solve('10 / 5');
    steps.forEach((s, idx) => {
      expect(s.step).toBe(idx + 1);
    });
  });

  // Error cases
  test('throws on empty string', () => {
    expect(() => solve('')).toThrow();
  });

  test('throws on whitespace-only string', () => {
    expect(() => solve('   ')).toThrow();
  });

  test('throws on invalid expression', () => {
    expect(() => solve('!@#invalid!@#')).toThrow();
  });

  test('throws when expression is not a string', () => {
    expect(() => solve(null)).toThrow();
  });
});

// ─── Integration tests: POST /solve ──────────────────────────────────────────

describe('POST /solve', () => {
  test('200 – basic addition', async () => {
    const res = await request(app)
      .post('/solve')
      .send({ expression: '2 + 2' });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe('4');
    expect(res.body.expression).toBe('2 + 2');
    expect(Array.isArray(res.body.steps)).toBe(true);
  });

  test('200 – sqrt function', async () => {
    const res = await request(app)
      .post('/solve')
      .send({ expression: 'sqrt(9)' });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe('3');
  });

  test('200 – complex arithmetic', async () => {
    const res = await request(app)
      .post('/solve')
      .send({ expression: '(5 + 3) * 2 - 4 / 2' });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe('14');
  });

  test('200 – exponentiation', async () => {
    const res = await request(app)
      .post('/solve')
      .send({ expression: '3^3' });

    expect(res.status).toBe(200);
    expect(res.body.result).toBe('27');
  });

  test('400 – missing expression field', async () => {
    const res = await request(app)
      .post('/solve')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('400 – empty expression', async () => {
    const res = await request(app)
      .post('/solve')
      .send({ expression: '' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('400 – whitespace-only expression', async () => {
    const res = await request(app)
      .post('/solve')
      .send({ expression: '   ' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('400 – invalid expression', async () => {
    const res = await request(app)
      .post('/solve')
      .send({ expression: '!@#invalid!@#' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('400 – non-string expression', async () => {
    const res = await request(app)
      .post('/solve')
      .send({ expression: 42 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── GET /health ─────────────────────────────────────────────────────────────

describe('GET /health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────

describe('Unknown routes', () => {
  test('returns 404 for unknown GET routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
  });
});
