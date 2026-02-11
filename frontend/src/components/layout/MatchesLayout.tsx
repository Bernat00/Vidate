import { useEffect, useState } from 'react';
import { Outlet, useLocation, useParams, useOutletContext } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

type MatchesOutletContext = {
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
  isKeyboardOpen?: boolean;
};

export default function MatchesLayout() {
  const location = useLocation();
  const { userId } = useParams<{ userId?: string }>();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { isKeyboardOpen } = useOutletContext<{ isKeyboardOpen: boolean }>();

  useEffect(() => {
    if (userId) {
      setSelectedUserId(userId);
      return;
    }

    const stateUserId = (location.state as { selectedUserId?: string | null } | null)?.selectedUserId ?? null;
    setSelectedUserId(stateUserId ?? null);
  }, [location.state, userId]);

  const isProfileRoute = location.pathname.startsWith('/my-matches/profile/');
  const title = isProfileRoute ? 'Match Profile' : 'Vidate';

  return (
    <DashboardLayout
      title={title}
      selectedUserId={selectedUserId}
      onSelectUserId={setSelectedUserId}
      isScrollable={isProfileRoute}
    >
      <Outlet context={{ selectedUserId, setSelectedUserId, isKeyboardOpen }} />
    </DashboardLayout>
  );
}

export type { MatchesOutletContext };

