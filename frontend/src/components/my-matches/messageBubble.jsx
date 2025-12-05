import React from "react";

const MessageBubble = ({ message }) => {
  const { isMe, text, time, sender, avatar } = message;

  return (
    <div className={`flex items-start gap-2.5 w-full ${isMe ? 'justify-end' : ''}`}>
      {!isMe && (
        <img className="w-8 h-8 rounded-full object-cover" src={avatar} alt={sender} />
      )}

      <div className={`flex flex-col gap-1 w-full max-w-[320px] ${isMe ? 'items-end' : ''}`}>
        <div className={`flex items-center space-x-2 ${isMe ? 'justify-end' : ''}`}>
          {!isMe && <span className="text-sm font-semibold text-textPrimary">{sender}</span>}
          <span className="text-sm font-normal text-textSecondary">{time}</span>
          {isMe && <span className="text-sm font-semibold text-textAccent">You</span>}
        </div>

        <div className={`flex flex-col leading-1.5 p-4 border border-borderAccentLight shadow-md text-textPrimary 
          ${isMe 
            ? 'bg-bgAccentSecondary rounded-s-xl rounded-ee-xl' 
            : 'bg-bgSecondary rounded-e-xl rounded-es-xl'
          }`}
        >
          <p className="text-sm font-normal">{text}</p>
        </div>
      </div>

      {isMe && (
        <img className="w-8 h-8 rounded-full object-cover" src={avatar} alt="Me" />
      )}
    </div>
  );
};

export default MessageBubble;