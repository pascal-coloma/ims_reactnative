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
  const sessionid = cookies['sessionid']?.value;
  const csrftoken = cookies['csrftoken']?.value;

  return fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionid ? { Cookie: `sessionid=${sessionid}` } : {}),
      ...(csrftoken ? { 'X-CSRFToken': csrftoken } : {}),
      ...options.headers,
    },
  });
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

  async function login(
    username: string,
    password: string,
  ): Promise<{ role: Role; personalId: string } | null> {
    try {
      await fetch(`${BASE_URL}/ims/api/login/`, {
        method: 'GET',
        credentials: 'include',
      });

      const cookies = await CookieManager.get(BASE_URL);
      const csrftoken = cookies['csrftoken']?.value;

      console.log('csrftoken:', csrftoken); // verificar que llega
      const response = await fetch(`${BASE_URL}/ims/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken ?? '' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      const loggedUser: User = {
        username,
        role: data.role as Role,
        personalId: data.id?.toString() ?? '',
        firstName: data.first_name ?? '',
        lastName: data.last_name ?? '',
      };
      setUser(loggedUser);
      await AsyncStorage.setItem('user', JSON.stringify(loggedUser));
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
