import { Platform } from 'react-native';

const formatPayload = (payload) => {
  if (payload === undefined) return '';
  try {
    return typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
};

export const logInfo = (message, payload) => {
  console.log(`[INFO] ${message}${payload ? ' | ' + formatPayload(payload) : ''}`);
};

export const logWarn = (message, payload) => {
  console.warn(`[WARN] ${message}${payload ? ' | ' + formatPayload(payload) : ''}`);
};

export const logError = (message, error, payload) => {
  const formattedError = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(`[ERROR] ${message}${payload ? ' | ' + formatPayload(payload) : ''}`);
  console.error(formattedError);
  if (error && error.stack) {
    console.error(error.stack);
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.reportError) {
    window.reportError(message, error, payload);
  }
};
