'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, AIAnalysis } from '@/types';
import { Calendar, Heart, Sparkles, ChevronDown, ChevronUp, Edit2, Trash2, Save, X } from 'lucide-react';
import RelatedNotes from './RelatedNotes';

interface NoteCardProps {
  note: Note;
  onNoteUpdate?: () => void;
}

export default function NoteCard({ note, onNoteUpdate }: NoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Parse AI analysis from cached data (no re-fetching needed)
  const analysis: AIAnalysis | null = note.aiAnalysis 
    ? JSON.parse(note.aiAnalysis) 
    : null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getMoodColor = (moodScore?: number) => {
    if (!moodScore) return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    if (moodScore >= 2) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (moodScore >= 0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (moodScore >= -2) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getMoodEmoji = (moodScore?: number) => {
    if (!moodScore) return '😐';
    if (moodScore >= 3) return '😄';
    if (moodScore >= 1) return '😊';
    if (moodScore >= 0) return '😐';
    if (moodScore >= -2) return '😔';
    return '😢';
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    
    try {
      const userProfile = localStorage.getItem('userProfile') || '';
      
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
          userProfile,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        onNoteUpdate?.();
      } else {
        console.error('Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onNoteUpdate?.();
      } else {
        console.error('Failed to delete note');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      setIsDeleting(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditContent(note.content);
  };

  const cancelDelete = () => {
    setIsDeleting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(note.createdAt)}
          </div>
          
          <div className="flex items-center gap-2">
            {analysis && (
              <>
                <span className="text-lg">{getMoodEmoji(analysis.moodScore)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(analysis.moodScore)}`}>
                  {note.emotionalTone || 'Analiz edilemiyor'}
                </span>
              </>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1 ml-2">
              {!isEditing && !isDeleting ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Düzenle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : isDeleting ? (
                <>
                  <span className="text-xs text-red-600 dark:text-red-400 mr-2">Emin misin?</span>
                  <button
                    onClick={handleDelete}
                    className="p-1.5 text-white bg-red-600 hover:bg-red-700 transition-colors rounded-md"
                    title="Evet, sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="İptal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="p-1.5 text-white bg-green-600 hover:bg-green-700 transition-colors rounded-md"
                    title="Kaydet"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="İptal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Notunu düzenle..."
              autoFocus
            />
            <div className="flex justify-end gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {editContent.length} karakter
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
            {note.content}
          </p>
        )}
        
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {note.tags.map((tag, index) => (
              tag && (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  <Heart className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              )
            ))}
          </div>
        )}
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="p-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-4 w-full text-left"
          >
            <Sparkles className="w-4 h-4" />
            AI Analizi ve İçgörüler
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-auto"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Emotional Analysis */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Duygusal Analiz
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Genel Ton:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {note.emotionalTone || 'Belirsiz'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Ruh Hali Skoru:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                        {analysis.moodScore ? `${analysis.moodScore}/5` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {analysis.mainEmotions && analysis.mainEmotions.length > 0 && (
                    <div className="mt-3">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Ana Duygular:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.mainEmotions.map((emotion, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded text-xs"
                          >
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Insights */}
                {analysis.reflection && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Yansıma
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {analysis.reflection}
                    </p>
                  </div>
                )}

                {/* Suggestions */}
                {analysis.suggestion && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Öneri
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {analysis.suggestion}
                    </p>
                  </div>
                )}

                {/* Response */}
                {analysis.response && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      AI Yanıtı
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {analysis.response}
                    </p>
                  </div>
                )}

                {/* Question */}
                {analysis.question && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Düşündürücü Soru
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                      "{analysis.question}"
                    </p>
                  </div>
                )}

                {/* Related Notes */}
                {analysis.mainEmotions && analysis.mainEmotions.length > 0 && (
                  <RelatedNotes 
                    emotion={analysis.mainEmotions[0]} 
                    currentNoteId={note.id} 
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
