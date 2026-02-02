import type { ReactElement } from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatInput from "../components/ChatInput.tsx";
import ChatColumn from '../components/layout/ChatColumn';
import DashboardLayout from '../components/layout/DashboardLayout';
import MessageList from '../components/chat/MessageList';
import EmptyState from '../components/common/EmptyState';
import { MessageSquare } from 'lucide-react';
import { getDisplayName } from '../helpers.ts';
import type { MatchItem, ChatMessage as ChatMessageType, ChatEventOut } from '../types/domain.ts';
import api from '../api.ts';
import { useWebSocket } from '../context/webSocketContext';
import { useAuth } from '../context/authContext';

export default function MyMatches(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const ws = useWebSocket();
  const { user } = useAuth()!;

  const selectedUserId = (location.state as { selectedUserId?: string | null } | null)?.selectedUserId ?? null;
  const selectedMatch = matches.find(m => m.profile?.user_id === selectedUserId);
  const selectedMatchId = selectedMatch?.match_id?.toString();

  const fetchMessages = useCallback(async (matchId: string, lastId?: number | string) => {
    if (loadingMessages || (!hasMore && lastId)) return;
    setLoadingMessages(true);
    try {
      const response = await api.get<ChatEventOut[]>(`/matches/${matchId}/events`, {
        params: { last_id: lastId }
      });
      const newChatEvents = response.data || [];

      const mappedMessages: ChatMessageType[] = newChatEvents.map(event => ({
        id: event.id,
        sender: event.originator_id === user?.id ? 'You' : getDisplayName(selectedMatch!),
        avatar: event.originator_id === user?.id
          ? 'https://i.pravatar.cc/150?u=me'
          : 'https://i.pravatar.cc/150?u=match',
        text: event.content || '',
        time: new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: event.originator_id === user?.id,
      })).reverse();

      if (lastId) {
        // Pagination: keep scroll position
        const container = scrollContainerRef.current;
        const oldScrollHeight = container?.scrollHeight || 0;

        setMessages(prev => [...mappedMessages, ...prev]);

        // Use timeout to wait for DOM update
        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - oldScrollHeight;
          }
        }, 0);
      } else {
        setMessages(mappedMessages);
        // Scroll to bottom on initial load
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
        }, 0);
      }

      setHasMore(newChatEvents.length === 30);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  }, [loadingMessages, hasMore, user?.id, selectedMatch]);

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

  useEffect(() => {
    if (selectedMatchId) {
      setMessages([]);
      setHasMore(true);
      fetchMessages(selectedMatchId);
    }
  }, [selectedMatchId]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container && container.scrollTop === 0 && hasMore && !loadingMessages && selectedMatchId) {
      const oldestMessage = messages[0];
      if (oldestMessage && typeof oldestMessage.id === 'number') {
        fetchMessages(selectedMatchId, oldestMessage.id);
      }
    }
  };

  useEffect(() => {
    if (!ws) return;

    return ws.subscribe('chat_message', (payload: unknown) => {
      const data = payload as {
        match_id?: string | number;
        originator_id?: string;
        id?: string | number;
        content?: string;
        timestamp?: string;
      };

      const matchId = data.match_id?.toString();
      if (!matchId || matchId !== selectedMatchId || !selectedMatch) return;

      const newMessage: ChatMessageType = {
        id: data.id || Date.now(),
        sender: data.originator_id === user?.id ? 'You' : getDisplayName(selectedMatch),
        avatar: data.originator_id === user?.id
          ? 'https://i.pravatar.cc/150?u=me'
          : 'https://i.pravatar.cc/150?u=match',
        text: data.content || '',
        time: data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: data.originator_id === user?.id,
      };

      setMessages(prev => [...prev, newMessage]);

      // Scroll to bottom on receive
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 0);
    });
  }, [ws, selectedMatchId, user?.id, selectedMatch]);

  const handleSelectUserId = (userId: string | null) => {
    setMessages([]); // Clear messages when switching matches
    setHasMore(true);
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

    setMessages(prev => [...prev, newMessage]);

    // Scroll to bottom on send
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 0);
  };

  const title = selectedMatch ? getDisplayName(selectedMatch) : 'Vidate';

  return (
    <DashboardLayout
      title={title}
      selectedUserId={selectedUserId}
      onSelectUserId={handleSelectUserId}
    >
      <ChatColumn>
        {selectedUserId ? (
      <div className="flex flex-col max-h-[calc(100vh-6rem)] overflow-hidden mb-2">
          {/* The MessageList now handles its own scrolling */}
          <MessageList
            messages={messages}
            className="flex-1 overflow-y-auto"
            // scrollRef={scrollContainerRef}
            // onScroll={handleScroll}
          />

          <ChatInput onSendMessage={onSendMessage} />
        </div>
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
