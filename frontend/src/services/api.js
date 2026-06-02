import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, FIREBASE_API_KEY, STORAGE_KEYS } from '../utils/constants';
import { logError } from '../utils/logger';

const refreshStoredToken = async () => {
  const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) return null;

  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
  });
  const data = await response.json();

  if (!response.ok) {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.TOKEN_EXPIRES_AT,
      STORAGE_KEYS.USER,
    ]);
    throw new Error(data.error?.message || 'Session expired. Please log in again.');
  }

  const expiresAt = Date.now() + (Number(data.expires_in || 3600) - 60) * 1000;
  await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, data.id_token);
  await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token || refreshToken);
  await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, String(expiresAt));
  return data.id_token;
};

const getToken = async () => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  const expiresAt = Number(await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT));

  if (token && expiresAt && Date.now() >= expiresAt) {
    return refreshStoredToken();
  }

  return token;
};

const request = async (endpoint, options = {}, hasRetried = false) => {
  const token = await getToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 20000);
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : {};

    if (!response.ok) {
      const message = data.message || 'Something went wrong';
      if (response.status === 401 && !hasRetried && message.toLowerCase().includes('token')) {
        await refreshStoredToken();
        return request(endpoint, options, true);
      }
      throw new Error(message);
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }

    if (error instanceof SyntaxError) {
      throw new Error('Server returned an invalid response. Please check that the API server is running.');
    }

    logError('API request failed', error, { endpoint, options });
    // If network failed, bubble up the error for callers that might implement fallbacks.
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const authAPI = {
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => request('/auth/me'),
  getMeWithToken: (idToken) => request('/auth/me', { headers: { Authorization: `Bearer ${idToken}` } }),
};

export const vehicleAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return request(`/vehicles${queryParams ? `?${queryParams}` : ''}`);
  },
  getById: (id) => request(`/vehicles/${id}`),
  create: (data) => request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),
};

export const bookingAPI = {
  create: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getMyBookings: () => request('/bookings/my-bookings'),
  getDriverRequests: () => request('/bookings/driver-requests'),
  updateStatus: (id, status, reviewData = null) => {
    const body = { status };
    if (reviewData) {
      body.rating = reviewData.rating;
      body.comment = reviewData.comment || reviewData.reviewText;
    }
    return request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) });
  },
  getById: (id) => request(`/bookings/${id}`),
  addReview: (id, rating, comment) => request(`/bookings/${id}/review`, { method: 'POST', body: JSON.stringify({ rating, comment }) }),
};

export const profileAPI = {
  getProfile: () => request('/profile'),
  updateProfile: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getMyVehicles: () => request('/profile/vehicles'),
  updatePushToken: (pushToken) => request('/profile/push-token', { method: 'PUT', body: JSON.stringify({ pushToken }) }),
};
