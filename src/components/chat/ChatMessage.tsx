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
  const isCurrentUser = user?.id === message.senderId;
  
  return (
    <div
      className={`flex ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      {!isCurrentUser && (
        <div className="mr-2 flex-shrink-0">
          <Avatar name={message.senderName} size="sm" />
        </div>
      )}
      
      <div className={`max-w-[75%]`}>
        {!isCurrentUser && (
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium text-gray-800">
              {message.senderName}
            </span>
            <span className="ml-2 text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
        
        <div
          className={`rounded-lg px-3 py-2 ${
            isCurrentUser
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {message.type === 'text' && <p>{message.content}</p>}
          
          {message.type === 'image' && message.mediaUrl && (
            <div>
              <p className="mb-2">{message.content}</p>
              <img
                src={message.mediaUrl}
                alt="Shared image"
                className="max-w-full rounded"
              />
            </div>
          )}
          
          {message.type === 'video' && message.mediaUrl && (
            <div>
              <p className="mb-2">{message.content}</p>
              <video
                controls
                className="max-w-full rounded"
              >
                <source src={message.mediaUrl} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
        
        {isCurrentUser && (
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>
      
      {isCurrentUser && (
        <div className="ml-2 flex-shrink-0">
          <Avatar src={user?.profileImage} name={user?.name} size="sm" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;