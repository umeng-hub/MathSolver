# MathSolver

A full-stack application that solves mathematical expressions step-by-step.
The **server** exposes a REST API powered by [math.js](https://mathjs.org/), and the **app** is a React Native Expo mobile application that lets users type expressions and see animated step-by-step solutions.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
  - [Server](#server)
  - [App](#app)
- [Running in Development](#running-in-development)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)

---

## Features

- **Step-by-step solutions** for arithmetic, algebra, and common math functions
- **Dark mode** toggle that respects the device colour scheme by default
- **History** screen with per-entry deletion and bulk clear
- **Error handling** at every layer – friendly messages for invalid input or network failures
- Fully tested server with Jest + Supertest

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18.x |
| npm | 9.x |
| Expo CLI (`npm i -g expo-cli`) | latest |
| iOS Simulator _or_ Android Emulator _or_ Expo Go (physical device) | — |

---

## Project Structure

```
MathSolver/
├── server/                     # Express API
│   ├── src/
│   │   ├── solver.js           # Math solving logic (math.js)
│   │   └── routes/
│   │       └── solve.js        # POST /solve route
│   ├── __tests__/
│   │   └── solver.test.js      # Unit + integration tests
│   ├── server.js               # Entry point
│   ├── .env.example
│   └── package.json
│
├── app/                        # React Native Expo app
│   ├── src/
│   │   ├── context/
│   │   │   ├── ThemeContext.js
│   │   │   └── HistoryContext.js
│   │   ├── screens/
│   │   │   ├── SolverScreen.js
│   │   │   └── HistoryScreen.js
│   │   ├── components/
│   │   │   ├── StepCard.js
│   │   │   └── HistoryItem.js
│   │   └── services/
│   │       └── api.js
│   ├── App.js
│   ├── app.json
│   ├── babel.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Setup & Installation

### Server

```bash
cd server
cp .env.example .env          # optionally edit PORT
npm install
```

### App

```bash
cd app
npm install
```

---

## Running in Development

**Terminal 1 – start the server:**

```bash
cd server
npm run dev          # nodemon auto-reloads on file changes
# or: npm start      # no auto-reload
```

The server listens on **http://localhost:3001** by default.

**Terminal 2 – start the Expo dev server:**

```bash
cd app
npm start
```

Scan the QR code with the **Expo Go** app (iOS/Android), or press `i` for iOS Simulator / `a` for Android Emulator.

> **Note:** If testing on a physical device, replace `localhost` in `app/src/services/api.js` (or set `API_URL`) with your machine's local IP address (e.g. `192.168.1.x`).

---

## Running Tests

```bash
cd server
npm test
```

Runs the full Jest test suite (unit tests for `solver.js` + integration tests for the HTTP routes).

---

## API Documentation

### `POST /solve`

Solve a mathematical expression and receive a step-by-step breakdown.

**Request**

```http
POST /solve
Content-Type: application/json

{
  "expression": "sqrt(144) + 2^3"
}
```

**Success response – 200 OK**

```json
{
  "expression": "sqrt(144) + 2^3",
  "result": "20",
  "steps": [
    { "step": 1, "description": "Identify the expression to evaluate", "expression": "sqrt(144) + 2^3" },
    { "step": 2, "description": "Recognise the mathematical function: sqrt()", "expression": "sqrt(x)" },
    { "step": 3, "description": "Apply the square root: √x returns the non-negative square root of x", "expression": "sqrt(144)" },
    { "step": 4, "description": "Calculate the final result", "expression": "sqrt(144) + 2^3 = 20" }
  ]
}
```

**Error response – 400 Bad Request**

```json
{ "error": "Invalid expression: Unexpected end of expression" }
```

**Supported operations**

| Category | Examples |
|----------|---------|
| Arithmetic | `2+2`, `10-3`, `6*7`, `10/2` |
| Exponentiation | `2^10`, `3^3` |
| Functions | `sqrt(x)`, `sin(x)`, `cos(x)`, `log(x)`, `abs(x)`, `exp(x)` |
| Algebra | `2*x + 3` (evaluated symbolically) |
| Grouped | `(2+3)*4`, `sqrt(3^2 + 4^2)` |

### `GET /health`

Returns `{ "status": "ok", "timestamp": "<ISO8601>" }` – useful for readiness checks.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | TCP port the server listens on |

### App

The API base URL defaults to `http://localhost:3001`.
To override, set the `API_URL` environment variable before bundling, or edit `app/src/services/api.js` directly.
