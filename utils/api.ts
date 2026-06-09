import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.imsambulancias.cl';

let _onSessionExpired: (() => void) | null = null;

export const setSessionExpiredHandler = (fn: () => void) => {
  _onSessionExpired = fn;
};

export const fetchConSesion = async (url: string, options: RequestInit = {}) => {
  const cookies = await CookieManager.get(BASE_URL);
  const sessionid = cookies['sessionid']?.value;
  const csrftoken = cookies['csrftoken']?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Origin: BASE_URL,
    ...(sessionid ? { Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken ?? ''}` } : {}),
    ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  const setCookie = response.headers.get('set-cookie');
  if (setCookie) await CookieManager.setFromResponse(BASE_URL, setCookie);

  if (response.status === 401) {
    await AsyncStorage.multiRemove(['user', 'sessionid', 'csrftoken']);
    await CookieManager.clearAll();
    _onSessionExpired?.();
  }

  return response;
};
