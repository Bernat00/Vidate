import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api from '../api';
import type { MatchItem } from '../types/domain';
import { useAuth } from './authContext';

interface MatchesContextType {
  matches: MatchItem[];
  loading: boolean;
  refreshMatches: () => Promise<void>;
}

const MatchesContext = createContext<MatchesContextType | undefined>(undefined);

export const MatchesProvider = ({ children }: { children: ReactNode }) => {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth()!;

  const refreshMatches = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.get<MatchItem[]>('/matches/mine');
      setMatches(response.data ?? []);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshMatches();
    } else {
      setMatches([]);
    }
  }, [user, refreshMatches]);

  return (
    <MatchesContext.Provider value={{ matches, loading, refreshMatches }}>
      {children}
    </MatchesContext.Provider>
  );
};

export const useMatches = () => {
  const context = useContext(MatchesContext);
  if (context === undefined) {
    throw new Error('useMatches must be used within a MatchesProvider');
  }
  return context;
};

