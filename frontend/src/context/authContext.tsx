/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, useRef } from 'react';
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
  const userRef = useRef<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Keep ref in sync with state
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get<UserMe>('/users/me');
      setUser(res.data);
      setLoading(false);
    } catch (error) {
       if (axios.isAxiosError(error)) {
          if (error.response) {
            if (error.response.status === 401) {
              setUser(null);
              setLoading(false);
            } else if (error.response.status === 403 && error.response.data?.detail === "Your account has been banned.") {
              showToast("Your account has been banned.", "error");
              localStorage.clear();
              sessionStorage.clear();
              setUser(null);
              setLoading(false);
            } else {
              setLoading(false);
            }
          } else {
            showToast("Network error. Please check your connection.", "error");

            // USE REF: Check last known user status without creating dependency loop
            if (userRef.current) {
              setLoading(false);
            }
          }
       } else {
          setLoading(false);
       }
    }
  }, [showToast]); // Removed 'user' from dependencies

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
