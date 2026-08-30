// Centralized Application & Network Server Configuration
// Change BACKEND_IP here whenever your machine's IP changes, and all frontend requests will instantly route to the new IP!

export const BACKEND_IP = '10.75.171.26';
export const BACKEND_PORT = 5000;
export const API_PREFIX = '/api/v1';

// Base API URL generated dynamically from BACKEND_IP or EXPO_PUBLIC_API_URL environment variable
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${BACKEND_IP}:${BACKEND_PORT}${API_PREFIX}`;
