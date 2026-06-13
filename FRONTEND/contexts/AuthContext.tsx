"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { login as apiLogin, register as apiRegister, TOKEN_KEY, USER_KEY } from "@/services/auth";
import type { User } from "@/services/auth";

export type { User };

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => ({ success: false }),
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore malformed data
    }
    setHydrated(true);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await apiLogin(email, password);
    if (!result) return false;
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    setUser(result.user);
    return true;
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    password: string,
  ) => {
    const result = await apiRegister(firstName, lastName, email, username, password);
    if (!result) return { success: false, error: 'Email o nombre de usuario ya en uso.' };
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    setUser(result.user);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  if (!hydrated) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
