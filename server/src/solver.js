'use strict';

const math = require('mathjs');

/**
 * Determine a human-readable category for an expression so the step
 * generator can tailor its explanations.
 */
function categorise(expression) {
  const expr = expression.trim();

  if (/[a-df-wxy-zA-DF-WXYZ]/.test(expr) && /[+\-*/^]/.test(expr)) {
    // Contains letters (excluding 'e'/'E' = Euler's number, 'i'/'I' = imaginary unit)
    // and at least one arithmetic operator → treat as algebraic
    return 'algebraic';
  }
  if (/\b(sqrt|cbrt|abs|ceil|floor|round|log|log2|log10|sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|exp|factorial|nthRoot)\b/.test(expr)) {
    return 'function';
  }
  if (/[+\-]/.test(expr) && !/[*/^]/.test(expr.replace(/[eE][+\-]?\d+/g, ''))) {
    return 'addition_subtraction';
  }
  if (/[*/]/.test(expr) && !/[+\-]/.test(expr.replace(/[eE][+\-]?\d+/g, ''))) {
    return 'multiplication_division';
  }
  if (/\^/.test(expr)) {
    return 'exponentiation';
  }
  return 'arithmetic';
}

/**
 * Extract the primary function name from an expression that starts with one.
 */
function extractFunctionName(expression) {
  const match = expression.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
  return match ? match[1] : null;
}

/**
 * Generate ordered step-by-step explanation objects for an expression.
 * Each step has: { step: Number, description: String, expression: String }
 */
function generateSteps(expression, result) {
  const expr = expression.trim();
  const category = categorise(expr);
  const steps = [];
  let stepNum = 1;

  // ── Step 1: always identify the problem ─────────────────────────────────
  steps.push({
    step: stepNum++,
    description: 'Identify the expression to evaluate',
    expression: expr,
  });

  // ── Category-specific intermediate steps ────────────────────────────────
  if (category === 'function') {
    const fnName = extractFunctionName(expr);
    const innerMatch = expr.match(/\((.+)\)$/);
    const inner = innerMatch ? innerMatch[1] : expr;

    if (fnName) {
      steps.push({
        step: stepNum++,
        description: `Recognise the mathematical function: ${fnName}()`,
        expression: `${fnName}(x)`,
      });
    }

    // Evaluate inner expression if it's not a plain number
    if (inner && isNaN(Number(inner))) {
      try {
        const innerResult = math.evaluate(inner);
        steps.push({
          step: stepNum++,
          description: `Evaluate the argument: ${inner}`,
          expression: `${inner} = ${math.format(innerResult, { precision: 10 })}`,
        });
      } catch (_) {
        // inner may contain variables – skip evaluation
      }
    }

    // Special explanations for common functions
    const fnDescriptions = {
      sqrt:  'Apply the square root: √x returns the non-negative square root of x',
      cbrt:  'Apply the cube root: ∛x',
      abs:   'Apply absolute value: |x| is the distance from zero',
      log:   'Apply natural logarithm: ln(x) = log base e of x',
      log10: 'Apply common logarithm: log₁₀(x)',
      log2:  'Apply binary logarithm: log₂(x)',
      sin:   'Apply sine function (argument in radians)',
      cos:   'Apply cosine function (argument in radians)',
      tan:   'Apply tangent function (argument in radians)',
      exp:   'Apply exponential function: e^x',
      factorial: 'Apply factorial: n! = n × (n-1) × … × 1',
    };

    if (fnName && fnDescriptions[fnName]) {
      steps.push({
        step: stepNum++,
        description: fnDescriptions[fnName],
        expression: `${fnName}(${inner})`,
      });
    }

  } else if (category === 'exponentiation') {
    const parts = expr.split('^');
    if (parts.length === 2) {
      const base = parts[0].trim();
      const exp  = parts[1].trim();
      steps.push({
        step: stepNum++,
        description: `Identify base (${base}) and exponent (${exp})`,
        expression: `${base}^${exp}`,
      });
      steps.push({
        step: stepNum++,
        description: `Raise ${base} to the power of ${exp}: use ${base} as a factor ${exp} time(s)`,
        expression: `${base}^${exp} = ${result}`,
      });
    }

  } else if (category === 'multiplication_division') {
    // Show each multiplication/division pair
    const tokens = expr.split(/([*/])/).map(t => t.trim()).filter(Boolean);
    if (tokens.length > 1) {
      let running = Number(tokens[0]);
      let runExpr = tokens[0];
      for (let i = 1; i < tokens.length - 1; i += 2) {
        const op  = tokens[i];
        const rhs = tokens[i + 1];
        const prev = running;
        running = op === '*' ? prev * Number(rhs) : prev / Number(rhs);
        runExpr = `${runExpr} ${op} ${rhs}`;
        if (!isNaN(running)) {
          steps.push({
            step: stepNum++,
            description: op === '*'
              ? `Multiply ${prev} × ${rhs}`
              : `Divide ${prev} ÷ ${rhs}`,
            expression: `${runExpr} = ${running}`,
          });
        }
      }
    }

  } else if (category === 'addition_subtraction') {
    const tokens = expr.split(/([+\-])/).map(t => t.trim()).filter(Boolean);
    // Rebuild signed numbers properly
    const numbers = [];
    let i = 0;
    while (i < tokens.length) {
      if ((tokens[i] === '+' || tokens[i] === '-') && i + 1 < tokens.length) {
        numbers.push({ sign: tokens[i], value: tokens[i + 1] });
        i += 2;
      } else {
        numbers.push({ sign: '+', value: tokens[i] });
        i++;
      }
    }

    if (numbers.length > 1) {
      steps.push({
        step: stepNum++,
        description: `Identify the terms: ${numbers.map(n => (n.sign === '-' ? '-' : '') + n.value).join(', ')}`,
        expression: expr,
      });

      let running = Number(numbers[0].value);
      for (let j = 1; j < numbers.length; j++) {
        const { sign, value } = numbers[j];
        const prev = running;
        running = sign === '-' ? prev - Number(value) : prev + Number(value);
        if (!isNaN(running)) {
          steps.push({
            step: stepNum++,
            description: sign === '-'
              ? `Subtract ${value} from ${prev}`
              : `Add ${value} to ${prev}`,
            expression: `${prev} ${sign} ${value} = ${running}`,
          });
        }
      }
    }

  } else if (category === 'algebraic') {
    steps.push({
      step: stepNum++,
      description: 'Identify variables and operators in the algebraic expression',
      expression: expr,
    });
    steps.push({
      step: stepNum++,
      description: 'Apply order of operations (PEMDAS/BODMAS): Parentheses → Exponents → Multiplication/Division → Addition/Subtraction',
      expression: expr,
    });

    // Try to simplify with math.js
    try {
      const simplified = math.simplify(expr).toString();
      if (simplified !== expr) {
        steps.push({
          step: stepNum++,
          description: 'Simplify the expression',
          expression: simplified,
        });
      }
    } catch (_) {
      // Not all algebraic expressions can be symbolically simplified
    }

  } else {
    // Generic arithmetic with order-of-operations reminder
    steps.push({
      step: stepNum++,
      description: 'Apply order of operations (PEMDAS/BODMAS)',
      expression: expr,
    });

    // Resolve parentheses first
    const parenMatch = expr.match(/\(([^()]+)\)/);
    if (parenMatch) {
      try {
        const inner = parenMatch[1];
        const innerResult = math.evaluate(inner);
        steps.push({
          step: stepNum++,
          description: `Evaluate expression inside parentheses: (${inner})`,
          expression: `(${inner}) = ${math.format(innerResult, { precision: 10 })}`,
        });
      } catch (_) { /* ignore */ }
    }
  }

  // ── Final step: the answer ───────────────────────────────────────────────
  steps.push({
    step: stepNum,
    description: 'Calculate the final result',
    expression: `${expr} = ${result}`,
  });

  return steps;
}

/**
 * Solve a mathematical expression string.
 * Returns { result, steps } or throws an Error with a user-friendly message.
 *
 * @param {string} expression - The math expression to evaluate
 * @returns {{ result: string, steps: Array }}
 */
function solve(expression) {
  if (!expression || typeof expression !== 'string') {
    throw new Error('Expression must be a non-empty string');
  }

  const trimmed = expression.trim();
  if (trimmed.length === 0) {
    throw new Error('Expression cannot be empty');
  }

  let rawResult;
  try {
    rawResult = math.evaluate(trimmed);
  } catch (err) {
    throw new Error(`Invalid expression: ${err.message}`);
  }

  // Handle matrix / complex results
  let result;
  if (typeof rawResult === 'number') {
    result = math.format(rawResult, { precision: 10 });
  } else if (rawResult && typeof rawResult === 'object' && 're' in rawResult) {
    // Complex number
    result = math.format(rawResult, { precision: 10 });
  } else {
    result = String(rawResult);
  }

  const steps = generateSteps(trimmed, result);

  return { result, steps };
}

module.exports = { solve, generateSteps, categorise };
