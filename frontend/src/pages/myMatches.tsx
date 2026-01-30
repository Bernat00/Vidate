import type { ReactElement } from 'react';
import { useState } from 'react';
import ChatInput from "../components/ChatInput.tsx";
import ChatColumn from '../components/layout/ChatColumn';
import DashboardLayout from '../components/layout/DashboardLayout';
import MessageList from '../components/chat/MessageList';
import EmptyState from '../components/common/EmptyState';
import { MessageSquare } from 'lucide-react';

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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <DashboardLayout
      title="Vidate"
      selectedUserId={selectedUserId}
      onSelectUserId={setSelectedUserId}
    >
      <ChatColumn>
        {selectedUserId ? (
          <>
            <MessageList messages={DUMMY_MESSAGES} />
            <ChatInput />
          </>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="Select a match to start chatting"
            description="Choose someone from your matches to view the conversation."
          />
        )}
      </ChatColumn>
    </DashboardLayout>
  );
}
