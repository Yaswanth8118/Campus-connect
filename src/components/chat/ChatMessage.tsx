import React from 'react';
import { Message } from '../../types';
import Avatar from '../ui/Avatar';
import { formatTime } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuthStore();
  const isMe = user?.id === message.senderId;

  return (
    <div className={`flex gap-2.5 mb-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="flex-shrink-0 self-end">
        <Avatar
          name={isMe ? user?.name : message.senderName}
          src={isMe ? user?.profileImage : undefined}
          size="sm"
        />
      </div>

      <div className={`flex flex-col max-w-[72%] ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-xs font-heading font-semibold text-ink-800 dark:text-dark-200">
              {message.senderName}
            </span>
            <span className="text-[11px] text-ink-400 dark:text-dark-500">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isMe
              ? 'bg-gradient-to-br from-primary-700 to-primary-600 text-white rounded-br-md'
              : 'bg-white dark:bg-dark-750 text-ink-900 dark:text-dark-100 border border-ink-100 dark:border-dark-600 rounded-bl-md'
          }`}
        >
          {message.type === 'text' && <p>{message.content}</p>}

          {message.type === 'image' && message.mediaUrl && (
            <div>
              {message.content && <p className="mb-2">{message.content}</p>}
              <img
                src={message.mediaUrl}
                alt="Shared image"
                className="max-w-full rounded-xl max-h-48 object-cover"
              />
            </div>
          )}

          {message.type === 'video' && message.mediaUrl && (
            <div>
              {message.content && <p className="mb-2">{message.content}</p>}
              <video controls className="max-w-full rounded-xl max-h-48">
                <source src={message.mediaUrl} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>

        {isMe && (
          <span className="text-[11px] text-ink-400 dark:text-dark-500 mt-1 px-1">
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
