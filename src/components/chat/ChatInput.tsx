import React, { useState } from 'react';
import { Send, Image, Paperclip } from 'lucide-react';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

interface ChatInputProps {
  roomId: string;
  onSendMessage: (content: string, type: 'text' | 'image' | 'video', mediaUrl?: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  roomId, 
  onSendMessage,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const { user } = useAuthStore();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user || disabled) return;
    
    onSendMessage(message.trim(), 'text');
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Mock file upload for demo
  const handleFileUpload = (type: 'image' | 'video') => {
    if (disabled) return;
    
    const mockUrl = type === 'image' 
      ? 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg'
      : 'https://example.com/sample-video.mp4';
    
    const caption = `Shared ${type}`;
    onSendMessage(caption, type, mockUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end border-t p-3 bg-white">
      <div className="flex-1 mr-2 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "You don't have permission to send messages" : "Type a message..."}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-800 focus:border-blue-800 resize-none max-h-32"
          disabled={disabled}
          rows={1}
        />
      </div>
      
      <div className="flex space-x-2">
        {!disabled && user?.role !== 'candidate' && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleFileUpload('image')}
              title="Share Image"
            >
              <Image size={18} />
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleFileUpload('video')}
              title="Share Video"
            >
              <Paperclip size={18} />
            </Button>
          </>
        )}
        
        <Button
          type="submit"
          size="sm"
          disabled={!message.trim() || disabled}
        >
          <Send size={18} />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;