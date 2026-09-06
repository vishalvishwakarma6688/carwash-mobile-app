// Centralized Application & Network Server Configuration
// Dynamically detects the host machine IP when running via Expo Go / mobile devices
import Constants from 'expo-constants';

const hostUri = Constants.expoConfig?.hostUri;
const rawIp = hostUri ? hostUri.split(':')[0] : null;

// Ignore virtual network adapter IPs (e.g. 10.75.x.x, 172.x.x.x) and use your actual LAN Wi-Fi IP (192.168.1.51)
const isVirtualIp = rawIp && (rawIp.startsWith('10.75.') || rawIp.startsWith('172.'));
export const BACKEND_IP = (!isVirtualIp && rawIp) ? rawIp : '192.168.1.51';

export const BACKEND_PORT = 5000;
export const API_PREFIX = '/api/v1';

// Base API URL generated dynamically from detected IP or EXPO_PUBLIC_API_URL environment variable
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${BACKEND_IP}:${BACKEND_PORT}${API_PREFIX}`;
