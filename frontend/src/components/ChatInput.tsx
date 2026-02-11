import { Send } from 'lucide-react';
import Icon from './common/Icon';
import type { FormEvent, KeyboardEvent } from 'react';
import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [content, setContent] = useState('');
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;

      // Toggle overflow based on whether content exceeds max-height (100px)
      const overflowing = scrollHeight > 100;
      setIsOverflowing(overflowing);

      if (overflowing) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }

      // Ensure we scroll to the bottom when content changes and we're at max height
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [content]);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = content.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setContent('');
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFocus = () => {
    window.dispatchEvent(new Event('chat-input-focus'));
  };

  const handleBlur = () => {
    window.dispatchEvent(new Event('chat-input-blur'));
  };

  return (
    <form className="w-full px-app-padding" onSubmit={handleSubmit}>
      <label htmlFor="chat" className="sr-only">Your message</label>
      <div className="relative">
        <textarea
          id="chat"
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className="block w-full p-2.5 pr-12 text-sm text-textPrimary bg-bgSecondary border border-borderAccentLight rounded-lg shadow-md focus:ring-borderAccent placeholder-textSecondary resize-none disabled:opacity-50 max-h-[100px] scrollbar-thin"
          placeholder="Your message..."
        />
        <button
          type="submit"
          onPointerDown={(e) => e.preventDefault()}
          disabled={!content.trim() || disabled}
          className={`absolute top-1/2 ${isOverflowing ? 'right-2 lg:right-4' : 'right-2'} -translate-y-1/2 p-2 text-textPrimary hover:bg-borderAccent rounded-full shadow transition-all disabled:opacity-50 disabled:hover:bg-transparent not-disabled:hover:cursor-pointer`}
        >
          <Icon icon={Send} size={16} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
