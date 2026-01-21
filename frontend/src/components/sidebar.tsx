import {useEffect, useState} from "react";
import api from "../api.ts";
import { X } from 'lucide-react';
import type { MatchItem } from '../types/domain.ts';
import ListItem from './common/ListItem';
import { Spinner } from 'flowbite-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get<MatchItem[]>('/matches');
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
             <Spinner color="purple" size="md" />
           </li>
        ) : matches.length === 0 ? (
           <li className="p-4 text-center text-textSecondary text-sm">No matches yet.</li>
        ) : (
          matches.map((match) => (
            <li key={match.id ?? match._id ?? `${match.name ?? match.username ?? ''}` }>
              <ListItem
                title={match.name || match.username || 'Match'}
                avatar={match.profilePicture || match.avatar || 'https://via.placeholder.com/32'}
                onClick={() => {}}
              />
            </li>
          ))
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
