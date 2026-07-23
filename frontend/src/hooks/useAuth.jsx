import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import { connectSocket, disconnectSocket } from '../lib/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const setToken = useCallback((next) => {
    if (next) localStorage.setItem('token', next);
    else localStorage.removeItem('token');
    setTokenState(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setUser(null);
      setIsLoading(false);
      disconnectSocket();
      return;
    }
    setIsLoading(true);
    client
      .get('/auth/me')
      .then(({ data }) => {
        if (cancelled) return;
        setUser(data.user);
        connectSocket(token);
      })
      .catch(() => {
        if (cancelled) return;
        setToken(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, setToken]);

  const login = useCallback(
    async (values) => {
      const { data } = await client.post('/auth/login', values);
      setToken(data.token);
      return data;
    },
    [setToken]
  );

  const register = useCallback(async (values) => {
    const { data } = await client.post('/auth/register', values);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await client.post('/auth/logout');
    } catch {
      /* token may already be invalid - clear local state regardless */
    }
    disconnectSocket();
    setToken(null);
  }, [setToken]);

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
