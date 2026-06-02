const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const isExpoPushToken = (token) => (
  typeof token === 'string'
  && (token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken['))
);

const sendPushNotification = async ({ to, title, body, data = {} }) => {
  if (!isExpoPushToken(to)) return false;

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        to,
        title,
        body,
        data,
        sound: 'default',
        channelId: 'booking-updates',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Expo push notification error:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Send push notification error:', error);
    return false;
  }
};

module.exports = { sendPushNotification };
