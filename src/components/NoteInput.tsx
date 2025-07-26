'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Smile } from 'lucide-react';
import { UserProfile } from '@/types';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import VoiceRecorder from './VoiceRecorder';

interface NoteInputProps {
  userProfile?: UserProfile;
}

export default function NoteInput({ userProfile }: NoteInputProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.slice(0, start) + emojiData.emoji + content.slice(end);
      setContent(newContent);
      
      // Focus back to textarea and set cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length);
        }
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const onVoiceTranscript = (transcript: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.slice(0, start) + ' ' + transcript + ' ' + content.slice(end);
      setContent(newContent);
      
      // Focus back to textarea and set cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPosition = start + transcript.length + 2;
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: content.trim(),
          userProfile 
        }),
      });

      if (response.ok) {
        setContent('');
        // Trigger a refresh of the notes list
        window.location.reload();
      } else {
        console.error('Failed to create note');
      }
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Yeni Not Ekle
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bugün nasıl hissediyorsun? Düşüncelerini paylaş..."
            className="w-full min-h-[120px] p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 
                     dark:text-white resize-none"
            disabled={isLoading}
            maxLength={500}
          />
          
          {/* Emoji Picker Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute bottom-3 right-3 p-2 text-gray-500 hover:text-gray-700 
                     dark:text-gray-400 dark:hover:text-gray-200 transition-colors 
                     hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
            disabled={isLoading}
          >
            <Smile className="w-5 h-5" />
          </button>
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-12 right-0 z-50"
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={300}
                height={400}
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {content.length}/500 karakter
            </span>
            
            <VoiceRecorder 
              onTranscript={onVoiceTranscript}
              isDisabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={!content.trim() || isLoading || content.length > 500}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                     disabled:bg-gray-400 text-white rounded-lg transition-colors 
                     disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analiz ediliyor...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Paylaş
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
