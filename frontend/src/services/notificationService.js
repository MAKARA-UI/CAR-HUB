import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { profileAPI } from './api';
import { navigateFromNotification } from '../navigation/navigationService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const getProjectId = () => (
  Constants.expoConfig?.extra?.eas?.projectId
  || Constants.easConfig?.projectId
  || Constants.expoConfig?.extra?.projectId
);

export const registerForPushNotifications = async () => {
  if (!Device.isDevice) return null;

  const existingPermission = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermission.status;

  if (existingPermission.status !== 'granted') {
    const permission = await Notifications.requestPermissionsAsync();
    finalStatus = permission.status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('booking-updates', {
      name: 'Booking updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0f7f7d',
    });
  }

  const tokenOptions = {};
  const projectId = getProjectId();
  if (projectId) tokenOptions.projectId = projectId;

  const token = (await Notifications.getExpoPushTokenAsync(tokenOptions)).data;
  await profileAPI.updatePushToken(token);
  return token;
};

export const addNotificationTapListener = () => {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data || {};
    navigateFromNotification(data);
  });

  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) {
      const data = response.notification.request.content.data || {};
      navigateFromNotification(data);
    }
  });

  return subscription;
};
