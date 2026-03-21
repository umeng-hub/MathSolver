import axios from 'axios';

// Default to localhost in development; override via app.json extra.apiUrl or
// set API_URL in your environment before bundling.
const BASE_URL = process.env.API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Send a math expression to the solver API.
 *
 * @param {string} expression - The mathematical expression to solve
 * @returns {Promise<{ expression: string, result: string, steps: Array }>}
 * @throws {Error} with a user-friendly message on failure
 */
export async function solveExpression(expression) {
  try {
    const response = await apiClient.post('/solve', { expression });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with a non-2xx status
      const message = error.response.data?.error || 'Server error. Please try again.';
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Cannot reach the server. Check that it is running on ' + BASE_URL);
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default apiClient;
