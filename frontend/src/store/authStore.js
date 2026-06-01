import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { FIREBASE_API_KEY, STORAGE_KEYS } from '../utils/constants';

const exchangeCustomToken = async (customToken) => {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: customToken,
        returnSecureToken: true,
      }),
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to exchange Firebase token');
  }

  return {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresIn: Number(data.expiresIn || 3600),
  };
};

export const authStore = create((set, get) => ({

  user: null,
  token: null,
  isLoading: false,
  error: null,

  setUser: (user, token, refreshToken = null, expiresIn = 3600) => {
    set({ user, token });
    if (token) AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    if (refreshToken) AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    if (token) {
      const expiresAt = Date.now() + (Number(expiresIn) - 60) * 1000;
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, String(expiresAt));
    }
    if (user) AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  clearUser: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    set({ user: null, token: null });
  },

  checkAuthState: async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token });

        authAPI.getMe()
          .then((response) => {
            if (response.success) set({ user: response.user });
          })
          .catch(async () => {
            await get().clearUser();
          });
      }

    } catch (error) {
      console.error('Check auth state error:', error);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        const session = await exchangeCustomToken(response.token);
        get().setUser(response.user, session.idToken, session.refreshToken, session.expiresIn);
        set({ isLoading: false });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, error: 'Login failed' };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(userData);
      if (response.success) {
        const session = await exchangeCustomToken(response.token);
        get().setUser(response.user, session.idToken, session.refreshToken, session.expiresIn);
        set({ isLoading: false });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await get().clearUser();
      set({ isLoading: false, user: null, token: null });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },
}));
