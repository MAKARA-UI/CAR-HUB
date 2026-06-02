import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const navigateFromNotification = (data = {}) => {
  if (!navigationRef.isReady()) return;

  const target = data.screen || 'Bookings';

  if (target === 'BookingDetails' || data.bookingId) {
    navigationRef.navigate('Main', {
      screen: 'Bookings',
      params: { bookingId: data.bookingId },
    });
    return;
  }

  if (target === 'Notifications') {
    navigationRef.navigate('Main', {
      screen: 'Profile',
      params: { screen: 'Notifications' },
    });
    return;
  }

  navigationRef.navigate('Main', { screen: 'Bookings' });
};
