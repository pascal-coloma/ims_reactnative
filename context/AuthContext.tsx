import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState } from 'react-native';

const BASE_URL = 'http://34.228.186.22';
const BACKEND_READY = true;

type Role = 'control' | 'medic' | 'nurse' | 'driver' | null;

type User = {
  username: string;
  role: Role;
  personalId: string;
  firstName: string;
  lastName: string;
} | null;

type AuthContextType = {
  user: User;
  login: (
    username: string,
    password: string,
    totpCode?: string,
  ) => Promise<{ role: Role; personalId: string } | null>;
  logout: () => Promise<void>;
  loading: boolean;
  pendingCredentials: { username: string; password: string } | null;
  setPendingCredentials: (creds: { username: string; password: string } | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const fetchConSesion = async (url: string, options: RequestInit = {}) => {
  const cookies = await CookieManager.get(BASE_URL);

  const sessionid = cookies['sessionid']?.value;
  const csrftoken = cookies['csrftoken']?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
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
  if (setCookie) {
    await CookieManager.setFromResponse(BASE_URL, setCookie);
  }

  return response;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCredentials, setPendingCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    const restore = async () => {
      try {
        const saved = await AsyncStorage.getItem('user');
        const savedSession = await AsyncStorage.getItem('sessionid');

        if (!saved || !savedSession) {
          setUser(null);
          return;
        }

        // Verificar si la cookie sigue viva
        const cookies = await CookieManager.get(BASE_URL);
        const sessionid = cookies['sessionid']?.value;

        // Si se perdió, reinyectarla desde AsyncStorage
        if (!sessionid) {
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

    // Reinyectar cookie cuando vuelve al foreground
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

    return () => sub.remove();
  }, []);

  async function login(username: string, password: string, totpCode?: string) {
    try {
      const getResp = await fetch(`${BASE_URL}/ims/api/login/`, {
        method: 'GET',
        credentials: 'include',
      });
      const setCookieGet = getResp.headers.get('set-cookie');
      if (setCookieGet) await CookieManager.setFromResponse(BASE_URL, setCookieGet);

      const cookies = await CookieManager.get(BASE_URL);
      const csrftoken = cookies['csrftoken']?.value;

      const response = await fetch(`${BASE_URL}/ims/api/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken ?? '',
        },
        body: JSON.stringify({
          username,
          password,
          totp_code: totpCode ?? '',
        }),
      });

      // 1. Verificar respuesta
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.log('login error:', response.status, JSON.stringify(errorBody));
        return null;
      }

      const data = await response.json();

      // 2. Persistir cookies solo si el login fue exitoso
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

      // 3. Obtener datos del usuario
      let firstName = '';
      let lastName = '';
      let personalId = '';

      try {
        const personalResp = await fetchConSesion('/ims/api/personal/');
        if (personalResp.ok) {
          const personalData: any[] = await personalResp.json();
          const match = personalData.find((p) => p.username === username);
          if (match) {
            firstName = match.first_name ?? '';
            lastName = match.last_name ?? '';
            personalId = match.id?.toString() ?? '';
          }
        }
      } catch (e) {
        console.warn('No se pudo obtener datos de personal:', e);
      }

      const loggedUser: User = {
        username,
        role: data.role as Role,
        personalId,
        firstName,
        lastName,
      };

      await AsyncStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      return { role: loggedUser.role, personalId: loggedUser.personalId };
    } catch (e) {
      console.error('Error login:', e);
      return null;
    }
  }

  async function logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['user', 'sessionid', 'csrftoken']);
      await CookieManager.clearAll();
      setUser(null);
    } catch (e) {
      console.error('Error logout:', e);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, pendingCredentials, setPendingCredentials }}
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
