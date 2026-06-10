import {
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { fetchConSesion } from '@/utils/api';

async function requestFcmPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }
  const status = await requestPermission(getMessaging());
  return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
}

async function postToken(token: string): Promise<void> {
  const res = await fetchConSesion('/ims/api/token/post/', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    throw new Error(`token/post/ -> ${res.status}`);
  }
}

export async function registerFcmToken(): Promise<void> {
  const granted = await requestFcmPermission();
  if (!granted) {
    console.warn('FCM token registration skipped: notification permission denied');
    return;
  }

  const token = await getToken(getMessaging());
  console.log(token);
  await postToken(token);
}

export function setupTokenRefresh(): () => void {
  return onTokenRefresh(getMessaging(), (token) => {
    postToken(token).catch((e) => console.warn('FCM token refresh failed:', e));
  });
}
