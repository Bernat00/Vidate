import MessageBubble from '../messageBubble';
import type {ChatMessage} from "../../types/domain.ts";
import type {RefObject} from 'react';
import CenteredLoader from '../layout/CenteredLoader';

interface MessageListProps {
  messages: ChatMessage[];
  className?: string;
  scrollRef?: RefObject<HTMLDivElement | null>;
  onScroll?: () => void;
  loadingTop?: boolean;
}

export default function MessageList({ messages, className = '', scrollRef, onScroll, loadingTop }: MessageListProps) {
  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className={`flex-1 w-full overflow-y-auto pr-2 flex flex-col gap-app-gap justify-start items-start ${className}`.trim()}
    >
      {loadingTop && (
        <CenteredLoader
          text=""
          className="w-full flex justify-center py-2"
          spinnerSize="h-6 w-6"
        />
      )}
      {messages.map((msg) => (
        <li key={msg.id} className="list-none w-full">
          <MessageBubble message={msg} />
        </li>
      ))}
    </div>
  );
}
