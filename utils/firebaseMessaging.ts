import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';
import { fetchConSesion } from '@/context/AuthContext';

const FCM_TOKEN_KEY = 'fcm_token';

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

async function postToken(token: string): Promise<void> {
  await fetchConSesion('/ims/api/token/post/', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
}

export async function registerFcmToken(): Promise<void> {
  const granted = await requestPermission();
  if (!granted) return;

  const token = await messaging().getToken();
  const cached = await AsyncStorage.getItem(FCM_TOKEN_KEY);
  if (cached === token) return;

  await postToken(token);
}

export function setupTokenRefresh(): () => void {
  return messaging().onTokenRefresh(async (token) => {
    await postToken(token);
  });
}
