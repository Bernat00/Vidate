import {useEffect, useState} from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import api from "../api.ts";
import { User, X } from 'lucide-react';
import type { MatchItem } from '../types/domain.ts';
import ListItem from './common/ListItem';
import CenteredLoader from './layout/CenteredLoader';
import { getDisplayName } from '../helpers.ts';
import EmptyState from './common/EmptyState';
import { Users } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUserId?: string | null;
  onSelectUserId?: (userId: string | null) => void;
}

const Sidebar = ({ isOpen, onClose, selectedUserId, onSelectUserId }: SidebarProps) => {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const activeUserId = selectedUserId
    ?? (location.pathname.startsWith('/my-matches/profile/') ? location.pathname.split('/').pop() : null);

  const formatMatchedAt = (value?: string | null) => {
    if (!value) {
      return '';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleDateString();
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get<MatchItem[]>('/matches/mine');
        console.log(response.data)
        setMatches(response.data ?? []);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-56 h-screen transition-transform bg-bgPrimary shadow-2xl border-r border-borderAccentLight ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <div className="flex items-center justify-center h-16 border-b border-borderAccentLight relative">
        <span className="text-lg font-bold text-textAccent lg:me-0 me-10">My Matches</span>
        <button
          onClick={onClose}
          className="lg:hidden absolute right-4 hover:text-borderAccent text-textPrimary"
        >
          <X />
        </button>
      </div>

      <ul className="space-y-3 mx-2 mt-4 font-medium text-textPrimary overflow-y-auto max-h-[calc(100vh-5rem)]">
        {loading ? (
           <li className="p-4 flex justify-center">
             <CenteredLoader
               text=""
               className="flex items-center justify-center"
               spinnerSize="h-8 w-8"
             />
           </li>
        ) : matches.length === 0 ? (
           <EmptyState 
            title="No matches yet" 
            description="Keep exploring to find your perfect match!" 
            icon={Users}
            className="mt-10"
          />
        ) : (
          matches.map((match, index) => {
            const userId = match.profile?.user_id ?? null;
            const matchedAt = formatMatchedAt(match.matched_at);

            const handleSelect = () => {
              if (!userId) {
                return;
              }

              onSelectUserId?.(userId);
              navigate('/my-matches', { state: { selectedUserId: userId } });
              onClose();
            };

            const handleOpenProfile = (event: React.MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              if (!userId) {
                return;
              }

              onSelectUserId?.(userId);
              navigate(`/my-matches/profile/${userId}`);
              onClose();
            };

            return (
              <li key={`${match.match_id ?? userId ?? 'match'}-${match.matched_at ?? index}`}>
                <ListItem
                  title={getDisplayName(match)}
                  subtitle={matchedAt ? `Matched ${matchedAt}` : undefined}
                  onClick={handleSelect}
                  active={userId !== null && userId === activeUserId}
                  className="border border-borderAccentLight border-l-4 border-l-borderAccent hover:border-borderAccent shadow-sm"
                  rightElement={(
                    <button
                      type="button"
                      onClick={handleOpenProfile}
                      className="flex items-center gap-1 px-2 py-1 rounded-full border border-borderAccentLight text-[11px] font-semibold text-textSecondary transition hover:border-borderAccent hover:text-textAccent hover:bg-bgSecondary hover:cursor-pointer"
                      aria-label="Open match profile"
                    >
                      <User className="w-3 h-3" />
                      Profile
                    </button>
                  )}
                />
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
