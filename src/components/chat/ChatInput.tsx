import React, { useState } from 'react';
import { Send, Image, Paperclip } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface ChatInputProps {
  roomId: string;
  onSendMessage: (content: string, type: 'text' | 'image' | 'video', mediaUrl?: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ roomId, onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const { user } = useAuthStore();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || disabled) return;
    onSendMessage(message.trim(), 'text');
    setMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`;
  };

  const handleFileUpload = (type: 'image' | 'video') => {
    if (disabled) return;
    const mockUrl = type === 'image'
      ? 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg'
      : 'https://example.com/sample-video.mp4';
    onSendMessage(`Shared ${type}`, type, mockUrl);
  };

  const canShareMedia = user?.role !== 'student';

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 px-4 py-3 bg-white dark:bg-dark-900 border-t border-ink-100 dark:border-dark-700/60"
    >
      {!disabled && canShareMedia && (
        <div className="flex items-center gap-1 pb-0.5">
          <button
            type="button"
            onClick={() => handleFileUpload('image')}
            className="p-2 rounded-xl text-ink-400 dark:text-dark-400 hover:bg-paper-100 dark:hover:bg-dark-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            title="Share Image"
          >
            <Image size={18} />
          </button>
          <button
            type="button"
            onClick={() => handleFileUpload('video')}
            className="p-2 rounded-xl text-ink-400 dark:text-dark-400 hover:bg-paper-100 dark:hover:bg-dark-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            title="Share Video"
          >
            <Paperclip size={18} />
          </button>
        </div>
      )}

      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "You don't have permission to send messages" : "Type a message..."}
          className="w-full bg-paper-50/60 dark:bg-dark-800 border border-ink-200 dark:border-dark-600 rounded-2xl px-4 py-2.5 text-sm text-ink-900 dark:text-dark-100 placeholder:text-ink-400 dark:placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 dark:focus:border-primary-500 resize-none transition-all max-h-32"
          disabled={disabled}
          rows={1}
        />
      </div>

      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-primary-700 to-primary-600 text-white hover:from-primary-800 hover:to-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95 mb-0.5"
      >
        <Send size={17} />
      </button>
    </form>
  );
};

export default ChatInput;
