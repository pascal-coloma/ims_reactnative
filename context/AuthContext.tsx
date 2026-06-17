// Copyright 2025 Pascal Coloma
// SPDX-License-Identifier: Apache-2.0

import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@preeternal/react-native-cookie-manager';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { registerFcmToken, setupTokenRefresh } from '@/utils/firebaseMessaging';
import { BASE_URL, setSessionExpiredHandler, fetchConSesion, clearSession } from '@/utils/api';

export { fetchConSesion, setSessionExpiredHandler };

type Role = 'control' | 'medic' | 'nurse' | 'driver' | null;

type User = {
  username: string;
  role: Role;
  personalId: string;
  first_name: string;
  last_name: string;
} | null;

type AuthContextType = {
  user: User;
  login: (username: string, password: string) => Promise<boolean>;
  totpValid: (totpCode?: string) => Promise<{ role: Role; personalId: string } | null>;
  logout: () => Promise<void>;
  loading: boolean;
  pendingCredentials: { username: string; password: string } | null;
  setPendingCredentials: (creds: { username: string; password: string } | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const fetchCsrfToken = async (): Promise<string> => {
  const getResp = await fetch(`${BASE_URL}/ims/api/login/`, {
    method: 'GET',
    credentials: 'include',
  });
  const setCookieGet = getResp.headers.get('set-cookie');
  if (setCookieGet) await CookieManager.setFromResponse(BASE_URL, setCookieGet);
  const cookies = await CookieManager.get(BASE_URL);
  return cookies['csrftoken']?.value ?? '';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCredentials, setPendingCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));

    const restore = async () => {
      try {
        const saved = await AsyncStorage.getItem('user');
        const savedSession = await AsyncStorage.getItem('sessionid');

        if (!saved || !savedSession) {
          setUser(null);
          return;
        }

        const cookies = await CookieManager.get(BASE_URL);

        if (!cookies['sessionid']?.value) {
          await CookieManager.set(BASE_URL, {
            name: 'sessionid',
            value: savedSession,
            path: '/',
            secure: true,
            httpOnly: true,
          });
        }

        setUser(JSON.parse(saved));
      } catch (e) {
        console.error('Error restaurando sesión:', e);
      } finally {
        setLoading(false);
      }
    };

    restore();

    const unsubTokenRefresh = setupTokenRefresh();
    const sub = AppState.addEventListener('change', async (state) => {
      if (state !== 'active') return;

      const [savedSession, savedCsrf] = await Promise.all([
        AsyncStorage.getItem('sessionid'),
        AsyncStorage.getItem('csrftoken'),
      ]);

      if (!savedSession) return;

      const cookies = await CookieManager.get(BASE_URL);

      if (!cookies['sessionid']?.value) {
        await CookieManager.set(BASE_URL, {
          name: 'sessionid',
          value: savedSession,
          path: '/',
          secure: true,
          httpOnly: true,
        });
      }

      if (savedCsrf && !cookies['csrftoken']?.value) {
        await CookieManager.set(BASE_URL, {
          name: 'csrftoken',
          value: savedCsrf,
          path: '/',
          secure: false,
          httpOnly: false,
        });
      }
    });

    return () => {
      sub.remove();
      unsubTokenRefresh();
      setSessionExpiredHandler(() => {});
    };
  }, []);

  async function login(username: string, password: string): Promise<boolean> {
    try {
      const csrftoken = await fetchCsrfToken();

      const response = await fetch(`${BASE_URL}/ims/api/auth/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Origin: BASE_URL,
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.log('login error:', response.status, JSON.stringify(errorBody));
        return false;
      }

      const setCookiePost = response.headers.get('set-cookie');
      if (setCookiePost) await CookieManager.setFromResponse(BASE_URL, setCookiePost);

      return true;
    } catch (e) {
      console.error('Error login:', e);
      return false;
    }
  }

  async function totpValid(totpCode?: string) {
    if (!pendingCredentials) return null;

    try {
      const csrftoken = await fetchCsrfToken();

      // TODO: reemplazar por el endpoint real cuando esté disponible en el backend.
      const response = await fetch(`${BASE_URL}/ims/api/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Origin: BASE_URL,
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ totp_code: totpCode ?? '' }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.log('totpValid error:', response.status, errorBody);
        return null;
      }

      const data = await response.json();

      const setCookiePost = response.headers.get('set-cookie');
      if (setCookiePost) await CookieManager.setFromResponse(BASE_URL, setCookiePost);

      const cookiesPost = await CookieManager.get(BASE_URL);

      if (!cookiesPost['sessionid']?.value) {
        console.error('sessionid no persistido después del login');
        return null;
      }

      const sessionId = cookiesPost['sessionid'].value;
      const csrftokenPost = cookiesPost['csrftoken']?.value;

      await AsyncStorage.setItem('sessionid', sessionId);
      await AsyncStorage.setItem('csrftoken', csrftokenPost ?? '');

      const { username } = pendingCredentials;
      let first_name = '';
      let last_name = '';
      let personalId = '';

      try {
        const personalResp = await fetchConSesion('/ims/api/personal/');
        if (personalResp.ok) {
          const personalData: any[] = await personalResp.json();
          const match = personalData.find((p) => p.username === username);
          if (match) {
            first_name = match.first_name ?? '';
            last_name = match.last_name ?? '';
            personalId = match.id?.toString() ?? '';
          }
        }
      } catch (e) {
        console.warn('No se pudo obtener datos de personal:', e);
      }

      const roleMap: Record<string, Role> = {
        medico: 'medic',
        tens: 'nurse',
        chofer: 'driver',
        control: 'control',
      };
      const rawRole: string = data.user_data?.role ?? '';
      const resolvedRole: Role = roleMap[rawRole] ?? (rawRole as Role) ?? null;

      const loggedUser: User = {
        username,
        role: resolvedRole,
        personalId,
        first_name,
        last_name,
      };

      await AsyncStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      registerFcmToken().catch((e) => console.warn('FCM token registration failed:', e));
      return { role: loggedUser.role, personalId: loggedUser.personalId };
    } catch (e) {
      console.error('Error totpValid:', e);
      return null;
    }
  }

  async function logout(): Promise<void> {
    try {
      await clearSession();
      setUser(null);
    } catch (e) {
      console.error('Error logout:', e);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        totpValid,
        loading,
        pendingCredentials,
        setPendingCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
