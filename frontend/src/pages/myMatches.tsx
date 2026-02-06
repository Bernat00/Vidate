import type { ReactElement } from 'react';
import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
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
import CenteredLoader from '../components/layout/CenteredLoader';

export default function MyMatches(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const initialScrollRef = useRef(false);
  const shouldScrollToBottomRef = useRef(false);

  const ws = useWebSocket();
  const { user } = useAuth()!;

  const selectedUserId = (location.state as { selectedUserId?: string | null } | null)?.selectedUserId ?? null;
  const selectedMatch = matches.find(m => m.profile?.user_id === selectedUserId);
  const selectedMatchId = selectedMatch?.match_id?.toString();

  const fetchMessages = useCallback(async (matchId: string, lastId?: number | string) => {
    if (isFetchingRef.current || (!hasMore && lastId)) return;

    isFetchingRef.current = true;
    setLoadingMessages(true);
    try {
      const response = await api.get<ChatEventOut[]>(`/matches/${matchId}/events`, {
        params: {
          last_id: lastId,
          limit: 30
        }
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

        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - oldScrollHeight;
          }
        }, 0);
      } else {
        setMessages(mappedMessages);
      }

      setHasMore(newChatEvents.length === 30);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
      isFetchingRef.current = false;
    }
  }, [hasMore, user?.id, selectedMatch]);

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
      initialScrollRef.current = true;
      fetchMessages(selectedMatchId);
    }
  }, [selectedMatchId]);

  useLayoutEffect(() => {
    if (!loadingMessages && initialScrollRef.current && messages.length > 0 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      initialScrollRef.current = false;
    }
  }, [messages, loadingMessages]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container && container.scrollTop === 0 && hasMore && !isFetchingRef.current && selectedMatchId) {
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

      const container = scrollContainerRef.current;
      const isNearBottom = container ? (container.scrollHeight - container.scrollTop - container.clientHeight < 300) : false;

      if (isNearBottom || data.originator_id === user?.id) {
        shouldScrollToBottomRef.current = true;
      }

      setMessages(prev => [...prev, newMessage]);
    });
  }, [ws, selectedMatchId, user?.id, selectedMatch]);

  useEffect(() => {
    if (shouldScrollToBottomRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      });
      shouldScrollToBottomRef.current = false;
    }
  }, [messages]);

  const handleSelectUserId = (userId: string | null) => {
    if (userId === selectedUserId) return;
    setMessages([]);
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
          loadingMessages && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 h-[calc(100vh-8.6rem)] lg:h-[calc(100vh-5.5rem)]">
              <CenteredLoader text="Loading conversation..." className="flex flex-col items-center justify-center gap-4" />
            </div>
          ) : (
            <div className="flex flex-col flex-1 max-h-[calc(100vh-8.6rem)] lg:max-h-[calc(100vh-5.5rem)] overflow-hidden mb-2">
              <MessageList
                messages={messages}
                className="flex-1 overflow-y-auto mb-2"
                scrollRef={scrollContainerRef}
                onScroll={handleScroll}
                loadingTop={loadingMessages && messages.length > 0}
              />
              <ChatInput onSendMessage={onSendMessage} />
            </div>
          )
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
