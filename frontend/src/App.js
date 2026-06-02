import React, { useEffect, useState } from 'react';
import { AppState, Platform, StatusBar as NativeStatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './navigation/AppNavigator';
import { navigationRef } from './navigation/navigationService';
import { addNotificationTapListener, registerForPushNotifications } from './services/notificationService';
import { authStore } from './store/authStore';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { COLORS } from './utils/constants';

const applySystemBars = () => {
  if (Platform.OS !== 'android') {
    return;
  }

  NativeStatusBar.setTranslucent(false);
  NativeStatusBar.setBackgroundColor(COLORS.gray, true);
  NativeStatusBar.setBarStyle('dark-content', true);
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { checkAuthState, user } = authStore();

  useEffect(() => {
    const initAuth = async () => {
      await checkAuthState();
      setIsLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    applySystemBars();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        applySystemBars();
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const subscription = addNotificationTapListener();
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!user) return;

    registerForPushNotifications().catch((error) => {
      console.log('Push notification registration error:', error.message);
    });
  }, [user?.id]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <ExpoStatusBar style="dark" backgroundColor={COLORS.gray} translucent={false} />
          <NavigationContainer ref={navigationRef}>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
});
