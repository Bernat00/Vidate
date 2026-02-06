import { useEffect, useState } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

type MatchesOutletContext = {
  selectedUserId: string | null;
  setSelectedUserId: (userId: string | null) => void;
};

export default function MatchesLayout() {
  const location = useLocation();
  const { userId } = useParams<{ userId?: string }>();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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
    >
      <Outlet context={{ selectedUserId, setSelectedUserId }} />
    </DashboardLayout>
  );
}

export type { MatchesOutletContext };

