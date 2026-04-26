import React, { createContext, useContext, useState, useCallback } from 'react';
import type { LoginResponse } from '../types';
import * as userApi from '../api/user';

interface AuthContextType {
  token: string | null;
  userInfo: LoginResponse | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserInfo: (info: Partial<LoginResponse>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('token'));
  const [userInfo, setUserInfo] = useState<LoginResponse | null>(() => {
    const stored = sessionStorage.getItem('userInfo');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });

  const isLoggedIn = !!token && !!userInfo;
  const isAdmin = userInfo?.role === 'ADMIN';

  const login = useCallback(async (username: string, password: string) => {
    const res = await userApi.login({ username, password });
    if (res.code === 200 && res.data) {
      const data = res.data;
      setToken(data.token);
      setUserInfo(data);
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('userInfo', JSON.stringify(data));
    } else {
      throw new Error(res.message || '登录失败');
    }
  }, []);

  const logout = useCallback(() => {
    userApi.logout().catch(() => {});
    setToken(null);
    setUserInfo(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userInfo');
    window.location.href = '/login';
  }, []);

  const updateUserInfoField = useCallback((info: Partial<LoginResponse>) => {
    setUserInfo((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...info };
      sessionStorage.setItem('userInfo', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      token, userInfo, isLoggedIn, isAdmin,
      login, logout, updateUserInfo: updateUserInfoField,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
