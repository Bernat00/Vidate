import type { ChatMessage } from '../types/domain';
import MessageBubble from '../messageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  className?: string;
}

export default function MessageList({ messages, className = '' }: MessageListProps) {
  return (
    <div className={`flex flex-col gap-app-gap justify-start items-start ${className}`.trim()}>
      {messages.map((msg) => (
        <li key={msg.id} className="list-none w-full">
          <MessageBubble message={msg} />
        </li>
      ))}
    </div>
  );
}
