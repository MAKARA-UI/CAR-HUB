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

export const PAYMENT_METHODS = {
  MPESA: { id: 'MPESA', label: 'M-Pesa' },
  ECOCASH: { id: 'ECOCASH', label: 'EcoCash' },
  BANK_TRANSFER: { id: 'BANK_TRANSFER', label: 'Bank Transfer' },
  CASH: { id: 'CASH', label: 'Cash' },
};

export const BANK_OPTIONS = ['Standard Bank', 'First National Bank (FNB)'];

export const BOOKING_STATUS = {
  PENDING: { label: 'Pending', color: COLORS.warning },
  ACCEPTED: { label: 'Confirmed', color: COLORS.success },
  REJECTED: { label: 'Rejected', color: COLORS.error },
  COMPLETED: { label: 'Completed', color: COLORS.primary },
  CANCELLED: { label: 'Cancelled', color: COLORS.grayDark },
};

import { API_URL, FIREBASE_API_KEY } from '../config/env';

export { API_URL, FIREBASE_API_KEY };

export const STORAGE_KEYS = {
  USER: '@ks_car_hub_user',
  TOKEN: '@ks_car_hub_token',
  REFRESH_TOKEN: '@ks_car_hub_refresh_token',
  TOKEN_EXPIRES_AT: '@ks_car_hub_token_expires_at',
  ONBOARDING_COMPLETED: '@onboarding_completed',
};
