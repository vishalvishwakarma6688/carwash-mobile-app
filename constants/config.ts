// Centralized Application & Network Server Configuration
import Constants from 'expo-constants';

const hostUri = Constants.expoConfig?.hostUri;
const rawIp = hostUri ? hostUri.split(':')[0] : null;

// Ignore virtual network adapter IPs (e.g. 10.75.x.x, 172.x.x.x) and fallback to local LAN Wi-Fi IP (192.168.1.51)
const isVirtualIp = rawIp && (rawIp.startsWith('10.75.') || rawIp.startsWith('172.'));
export const LOCAL_BACKEND_IP = (!isVirtualIp && rawIp) ? rawIp : '192.168.1.51';

export const BACKEND_PORT = 5000;
export const API_PREFIX = '/api/v1';

// Production Live Render Backend URL
export const LIVE_BACKEND_URL = `https://carwash-apix.onrender.com${API_PREFIX}`;

// Base API URL defaults to live Render backend URL or EXPO_PUBLIC_API_URL
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || LIVE_BACKEND_URL;
