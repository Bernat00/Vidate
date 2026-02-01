import { Send } from 'lucide-react';
import Icon from './common/Icon';
import type { FormEvent, KeyboardEvent } from 'react';
import { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = content.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setContent('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form className="w-full px-app-padding" onSubmit={handleSubmit}>
      <label htmlFor="chat" className="sr-only">Your message</label>
      <div className="relative">
        <textarea
          id="chat"
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="block w-full p-2.5 pr-12 text-sm text-textPrimary bg-bgSecondary border border-borderAccentLight rounded-lg shadow-md focus:ring-borderAccent placeholder-textSecondary resize-none disabled:opacity-50"
          placeholder="Your message..."
        />
        <button
          type="submit"
          disabled={!content.trim() || disabled}
          className="absolute top-1/2 right-2 -translate-y-1/2 p-2 text-textPrimary hover:bg-borderAccent rounded-full shadow transition disabled:opacity-50 disabled:hover:bg-transparent"
        >
          <Icon icon={Send} size={16} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
