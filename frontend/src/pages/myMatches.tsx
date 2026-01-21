import type { ReactElement } from 'react';
import ChatInput from "../components/ChatInput.tsx";
import ChatColumn from '../components/layout/ChatColumn';
import DashboardLayout from '../components/layout/DashboardLayout';
import MessageList from '../components/chat/MessageList';

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
  return (
    <DashboardLayout title="Vidate">
      <ChatColumn>
        <MessageList messages={DUMMY_MESSAGES} />
        <ChatInput />
      </ChatColumn>
    </DashboardLayout>
  );
}
