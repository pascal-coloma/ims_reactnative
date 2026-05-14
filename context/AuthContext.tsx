import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const BASE_URL = 'http://3.84.131.141';
const BACKEND_READY = true;

type Role = 'control' | 'medic' | 'nurse' | null;

type User = {
  username: string;
  role: Role;
  personalId: string;
  firstName: string;
  lastName: string;
} | null;

type AuthContextType = {
  user: User;
  login: (username: string, password: string) => Promise<{ role: Role; personalId: string } | null>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const fetchConSesion = async (url: string, options: RequestInit = {}) => {
  const cookies = await CookieManager.get(BASE_URL);
  console.log(cookies);
  const sessionid = cookies['sessionid']?.value;
  const csrftoken = cookies['csrftoken']?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(sessionid ? { Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken ?? ''}` } : {}),
    // Siempre enviamos el CSRF header — Django lo ignora en GET/HEAD, pero lo exige en POST/PATCH
    ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  // Persistir cookies que Django devuelva (sessionid nuevo, rotación de csrf, etc.)
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    await CookieManager.setFromResponse(BASE_URL, setCookie);
  }

  return response;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const cookies = await CookieManager.get(BASE_URL);
        const sessionid = cookies['sessionid']?.value;
        const saved = await AsyncStorage.getItem('user');

        if (sessionid && saved) {
          setUser(JSON.parse(saved));
        } else {
          await AsyncStorage.removeItem('user');
          await CookieManager.clearAll();
          setUser(null);
        }
      } catch (e) {
        console.error('Error restaurando sesión:', e);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // AuthContext.tsx — función login()
  async function login(username: string, password: string) {
    try {
      const getResp = await fetch(`${BASE_URL}/ims/api/login/`, {
        method: 'GET',
        credentials: 'include',
      });
      const setCookieGet = getResp.headers.get('set-cookie');
      if (setCookieGet) {
        await CookieManager.setFromResponse(BASE_URL, setCookieGet);
      }

      const cookies = await CookieManager.get(BASE_URL);
      const csrftoken = cookies['csrftoken']?.value;

      const response = await fetch(`${BASE_URL}/ims/api/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken ?? '',
        },
        body: JSON.stringify({ username, password }),
      });

      const setCookiePost = response.headers.get('set-cookie');
      if (setCookiePost) {
        await CookieManager.setFromResponse(BASE_URL, setCookiePost); // ← awaited
      }

      // ✅ Verificar que la cookie quedó antes de setUser
      const cookiesPost = await CookieManager.get(BASE_URL);
      if (!cookiesPost['sessionid']?.value) {
        console.error('sessionid no persistido después del login');
        return null;
      }

      if (!response.ok) return null;

      const data = await response.json();
      const loggedUser: User = {
        username,
        role: data.role as Role,
        personalId: data.id?.toString() ?? '',
        firstName: data.first_name ?? '',
        lastName: data.last_name ?? '',
      };

      await AsyncStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser); // ← recién acá, cuando todo está listo
      return { role: loggedUser.role, personalId: loggedUser.personalId };
    } catch (e) {
      console.error('Error login:', e);
      return null;
    }
  }

  async function logout(): Promise<void> {
    try {
      await CookieManager.clearAll();
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (e) {
      console.error('Error logout:', e);
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
