import type { ChatMessage } from '../types/domain.ts';

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const { isMe, text, time, sender, avatar } = message;

  return (
    <div className={`flex items-start gap-2.5 w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && (
        <img className="w-8 h-8 rounded-full object-cover flex-shrink-0" src={avatar} alt={sender} />
      )}

      {/* 1. Removed w-full
          2. Added items-start for the other party to prevent stretching
      */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center space-x-2 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {!isMe && <span className="text-sm font-semibold text-textPrimary">{sender}</span>}
          <span className="text-xs font-normal text-textSecondary">{time}</span>
          {isMe && <span className="text-sm font-semibold text-textAccent">You</span>}
        </div>

        <div className={`flex flex-col leading-1.5 p-3 border border-borderAccentLight shadow-sm text-textPrimary 
          ${isMe 
            ? 'bg-bgAccentSecondary rounded-s-xl rounded-ee-xl' 
            : 'bg-bgSecondary rounded-e-xl rounded-es-xl'
          }
        `}>
          <p className="text-sm font-normal wrap-anywhere">{text}</p>
        </div>
      </div>

      {isMe && (
        <img className="w-8 h-8 rounded-full object-cover flex-shrink-0" src={avatar} alt="Me" />
      )}
    </div>
  );
};

export default MessageBubble;