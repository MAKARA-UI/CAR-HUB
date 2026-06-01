import { Platform } from 'react-native';

export const COLORS = {
  primary: '#0f7f7d',
  primaryDark: '#0a6f6d',
  primaryLight: '#d8f5ee',
  secondary: '#ff9800',
  secondaryDark: '#df7d00',
  white: '#ffffff',
  black: '#1f2937',
  gray: '#f4f6f8',
  grayDark: '#6b7280',
  grayLight: '#e5e7eb',
  success: '#10b981',
  error: '#ef4444',
  warning: '#ff9800',
  info: '#1788c9',
};

export const VEHICLE_TYPES = [
  { id: 'all', label: 'All', icon: 'directions-car' },
  { id: 'sedan', label: 'Sedan', icon: 'directions-car' },
  { id: 'suv', label: 'SUV', icon: 'airport-shuttle' },
  { id: '4x4', label: '4x4', icon: 'terrain' },
  { id: 'bakkie', label: 'Bakkie', icon: 'local-shipping' },
  { id: 'minibus', label: 'Minibus', icon: 'directions-bus' },
];

export const SERVICE_CATEGORIES = [
  { id: 'local', label: 'Local' },
  { id: 'long_distance', label: 'Long Distance' },
  { id: 'highlands', label: 'Highlands' },
  { id: 'outside_country', label: 'Outside Country' },
];

export const SERVICE_MODES = [
  { id: 'individual', label: 'Private Hire' },
  { id: 'trip', label: 'Shared Trip' },
];

export const CATEGORY_MODE_REQUIRED = ['long_distance', 'highlands', 'outside_country'];

export const BOOKING_STATUS = {
  PENDING: { label: 'Pending', color: COLORS.warning },
  ACCEPTED: { label: 'Confirmed', color: COLORS.success },
  REJECTED: { label: 'Rejected', color: COLORS.error },
  COMPLETED: { label: 'Completed', color: COLORS.primary },
  CANCELLED: { label: 'Cancelled', color: COLORS.grayDark },
};

const getApiHost = () => {
  // For a REAL Android device, use your computer's LAN IP.
  // For Android emulator, use 10.0.2.2.
  if (Platform.OS === 'android') return '10.103.84.77';
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.hostname || 'localhost';
  return 'localhost';
};

export const API_URL = `http://${getApiHost()}:5001/api`;
export const FIREBASE_API_KEY = 'AIzaSyBMRqfvCEDXWUFUJj22HVNstLM_rw8TNkE';

export const STORAGE_KEYS = {
  USER: '@ks_car_hub_user',
  TOKEN: '@ks_car_hub_token',
  REFRESH_TOKEN: '@ks_car_hub_refresh_token',
  TOKEN_EXPIRES_AT: '@ks_car_hub_token_expires_at',
  ONBOARDING_COMPLETED: '@onboarding_completed',
};
