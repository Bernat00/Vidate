import { useEffect } from 'react';
import { useWebSocket } from '../context/webSocketContext';
import { useAuth } from '../context/authContext';
import { useMatches } from '../context/matchesContext';
import { useToast } from '../context/toastContext';

export const NotificationListener = () => {
  const { subscribe } = useWebSocket();
  const { refreshMatches } = useMatches();
  const { showToast } = useToast();
  const auth = useAuth();
  const user = auth?.user;

  useEffect(() => {
    if (!user) return;

    // Subscribe to match notifications (Mutual Like)
    // Only listening for "match_confirmed" as per request
    const unsubscribeMatchConfirmed = subscribe('match_confirmed', (payload: any) => {
          refreshMatches();
          showToast(`It's a Match! You and ${payload.peer_name} like each other`, 'match');
    });

    return () => {
      unsubscribeMatchConfirmed();
    };
  }, [subscribe, user, refreshMatches, showToast]);

  return null;
};

