import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatInput from "../components/ChatInput.tsx";
import ChatColumn from '../components/layout/ChatColumn';
import DashboardLayout from '../components/layout/DashboardLayout';
import MessageList from '../components/chat/MessageList';
import EmptyState from '../components/common/EmptyState';
import { MessageSquare } from 'lucide-react';
import { getDisplayName } from '../helpers.ts';
import type { MatchItem } from '../types/domain.ts';
import api from '../api.ts';

const DUMMY_MESSAGES = [
    {
      id: 1,
      sender: 'Bonnie Green',
      avatar: 'https://i.pravatar.cc/150?u=1',
      text: 'Hello, how are you doing?',
      time: '11:46',
      isMe: false,
    },
    {
      id: 2,
      sender: 'You',
      avatar: 'https://i.pravatar.cc/150?u=99',
      text: "I'm doing great, thanks for asking! 😊",
      time: '11:48',
      isMe: true,
    },
  ];


export default function MyMatches(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchItem[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get<MatchItem[]>('/matches/mine');
        setMatches(response.data ?? []);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      }
    };
    fetchMatches();
  }, []);

  const selectedUserId = (location.state as { selectedUserId?: string | null } | null)?.selectedUserId ?? null;

  const handleSelectUserId = (userId: string | null) => {
    navigate('/my-matches', { state: { selectedUserId: userId }, replace: true });
  };

  const selectedMatch = matches.find(m => m.profile?.user_id === selectedUserId);
  const title = selectedMatch ? getDisplayName(selectedMatch) : 'Vidate';

  return (
    <DashboardLayout
      title={title}
      selectedUserId={selectedUserId}
      onSelectUserId={handleSelectUserId}
    >
      <ChatColumn>
        {selectedUserId ? (
          <>
            <div className="flex-1 overflow-y-auto mb-4">
              <MessageList messages={DUMMY_MESSAGES} />
            </div>
            <ChatInput />
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <EmptyState
              icon={MessageSquare}
              title="Select a match to start chatting"
              description="Choose someone from your matches to view the conversation."
            />
          </div>
        )}
      </ChatColumn>
    </DashboardLayout>
  );
}
