import { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'admin' | 'user' | null;

type User = {
  email: string;
  role: Role;
} | null;

type AuthContextType = {
  user: User;
  login: (email: string, password: string) => Role;
  logout: () => void;
};

const USERS = [
  { email: 'admin@ims.com', password: '1234', role: 'admin' as Role },
  { email: 'user@ims.com', password: '1234', role: 'user' as Role },
];

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  function login(email: string, password: string): Role | null {
    const match = USERS.find((u) => u.email === email && u.password === password);
    if (!match) return null;
    setUser({ email: match.email, role: match.role });
    return match.role;
  }

  function logout() {
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
