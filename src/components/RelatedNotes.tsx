'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { Calendar, Heart, ChevronRight, Loader2 } from 'lucide-react';

interface RelatedNotesProps {
  emotion: string;
  currentNoteId: string;
}

export default function RelatedNotes({ emotion, currentNoteId }: RelatedNotesProps) {
  const [relatedNotes, setRelatedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchRelatedNotes();
  }, [emotion, currentNoteId]);

  const fetchRelatedNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notes/related?emotion=${encodeURIComponent(emotion)}&excludeId=${currentNoteId}`);
      
      if (response.ok) {
        const data = await response.json();
        setRelatedNotes(data.relatedNotes || []);
      }
    } catch (error) {
      console.error('Error fetching related notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short'
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span className="text-sm text-indigo-800 dark:text-indigo-200">
            Benzer duygularla yazdığın notlar aranıyor...
          </span>
        </div>
      </div>
    );
  }

  if (relatedNotes.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium mb-3 w-full text-left"
      >
        <Heart className="w-4 h-4" />
        <span>
          {emotion} hissiyle yazdığın {relatedNotes.length} not daha var
        </span>
        <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {relatedNotes.map((note) => (
            <div 
              key={note.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-indigo-200 dark:border-indigo-700"
            >
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <Calendar className="w-3 h-3" />
                {formatDate(note.createdAt)}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}>
                {note.content}
              </p>
              {note.emotionalTone && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs rounded-full">
                    {note.emotionalTone}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
