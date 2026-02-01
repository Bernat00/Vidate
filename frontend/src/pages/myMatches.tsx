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
import type { MatchItem, ChatMessage as ChatMessageType } from '../types/domain.ts';
import api from '../api.ts';
import { useWebSocket } from '../context/webSocketContext';
import { useAuth } from '../context/authContext';

export default function MyMatches(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessageType[]>>({});

  const ws = useWebSocket();
  const { user } = useAuth()!;

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
  const selectedMatch = matches.find(m => m.profile?.user_id === selectedUserId);
  const selectedMatchId = selectedMatch?.match_id?.toString();

  useEffect(() => {
    if (!ws) return;

    return ws.subscribe((message) => {
      if (message.type === 'chat_message') {
        const payload = message.payload as any;
        const matchId = payload.match_id?.toString();

        if (!matchId) return;

        const senderMatch = matches.find(m => m.match_id?.toString() === matchId);
        if (!senderMatch && payload.originator_id !== user?.id) return;

        const newMessage: ChatMessageType = {
          id: payload.id || Date.now(),
          sender: payload.originator_id === user?.id ? 'You' : getDisplayName(senderMatch!),
          avatar: payload.originator_id === user?.id
            ? 'https://i.pravatar.cc/150?u=me' // Placeholder for current user
            : senderMatch?.profile?.avatar || senderMatch?.profile?.profilePicture || 'https://i.pravatar.cc/150?u=unknown',
          text: payload.content,
          time: new Date(payload.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: payload.originator_id === user?.id,
        };

        setAllMessages(prev => ({
          ...prev,
          [matchId]: [...(prev[matchId] || []), newMessage]
        }));
      }
    });
  }, [ws, matches, user?.id]);

  const handleSelectUserId = (userId: string | null) => {
    navigate('/my-matches', { state: { selectedUserId: userId }, replace: true });
  };

  const onSendMessage = (content: string) => {
    if (!selectedMatch || !selectedMatchId || !ws) return;

    const recipientId = selectedMatch.profile?.user_id;
    if (!recipientId) return;

    ws.send({
      type: 'chat_message',
      payload: {
        match_id: selectedMatch.match_id,
        recipient_id: recipientId,
        content
      }
    });

    // Optimistically add to UI
    const newMessage: ChatMessageType = {
      id: `temp-${Date.now()}`,
      sender: 'You',
      avatar: 'https://i.pravatar.cc/150?u=me',
      text: content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setAllMessages(prev => ({
      ...prev,
      [selectedMatchId]: [...(prev[selectedMatchId] || []), newMessage]
    }));
  };

  const currentMessages = selectedMatchId ? (allMessages[selectedMatchId] || []) : [];
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
              <MessageList messages={currentMessages} />
            </div>
            <ChatInput onSendMessage={onSendMessage} />
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
