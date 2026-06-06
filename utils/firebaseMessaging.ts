import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { fetchConSesion } from '@/context/AuthContext';

async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }
  const status = await messaging().requestPermission();
  return (
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL
  );
}

export async function registerFcmToken(): Promise<void> {
  const granted = await requestPermission();
  if (!granted) return;

  const token = await messaging().getToken();
  await fetchConSesion('/ims/api/token/post/', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function setupTokenRefresh(): () => void {
  return messaging().onTokenRefresh(async (token) => {
    await fetchConSesion('/ims/api/token/post/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  });
}
