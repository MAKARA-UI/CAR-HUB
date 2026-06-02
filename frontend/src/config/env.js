const requireEnv = (name) => {
    const value = process.env?.[name];
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
  };
  
  export const API_URL = requireEnv("EXPO_PUBLIC_API_URL");
  
  export const FIREBASE_API_KEY = requireEnv("EXPO_PUBLIC_FIREBASE_API_KEY");
  
  export const FIREBASE_PROJECT_ID = requireEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID");