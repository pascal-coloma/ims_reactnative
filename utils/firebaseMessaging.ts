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
  const response = await fetchConSesion('/ims/api/token/post/', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`postToken failed: ${response.status} ${body}`);
  }
}

export async function registerFcmToken(): Promise<void> {
  const granted = await requestFcmPermission();
  if (!granted) return;

  const token = await getToken(getMessaging());
  await postToken(token);
}

export function setupTokenRefresh(): () => void {
  return onTokenRefresh(getMessaging(), async (token) => {
    await postToken(token);
  });
}
