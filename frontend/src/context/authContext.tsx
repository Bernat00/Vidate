/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import api from '../api';
import type { UserMe } from '../types/domain';
import { useToast } from './toastContext';

interface AuthContextValue {
  user: UserMe | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      const res = await api.get<UserMe>('/users/me');
      setUser(res.data);
    } catch (error) {
       if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            setUser(null);
          } else if (error.response?.status === 403 && error.response?.data?.detail === "Your account has been banned.") {
            showToast("Your account has been banned.", "error");
            localStorage.clear();
            sessionStorage.clear();
            setUser(null);
          }
       }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleBanned = (e: any) => {
      showToast(e.detail, "error");
      setUser(null);
    };

    window.addEventListener('auth:banned', handleBanned);
    return () => window.removeEventListener('auth:banned', handleBanned);
  }, [showToast]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue | null {
  return useContext(AuthContext);
}
