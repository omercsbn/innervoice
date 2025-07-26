'use client';

import { useState, useEffect } from 'react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import { Note } from '@/types';
import NoteCard from './NoteCard';
import EmotionalTrends from './EmotionalTrends';
import SearchFilters from './SearchFilters';
import { NoteListSkeleton } from './LoadingSkeletons';
import SortableNoteCard from './SortableNoteCard';

export default function NotesList() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableEmotions, setAvailableEmotions] = useState<string[]>([]);
  const [isDragMode, setIsDragMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [notesPerPage, setNotesPerPage] = useState(10);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    // Extract all unique emotions
    const emotions = new Set<string>();
    allNotes.forEach(note => {
      note.tags?.forEach(tag => {
        if (tag) emotions.add(tag);
      });
    });
    setAvailableEmotions(Array.from(emotions).sort());
    setFilteredNotes(allNotes);
  }, [allNotes]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notes');
      
      if (response.ok) {
        const data = await response.json();
        setAllNotes(data.notes || []);
      } else {
        setError('Notlar yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Bağlantı hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (searchQuery: string, emotions: string[], startDate: string, endDate: string) => {
    let filtered = [...allNotes];

    // Text search
    if (searchQuery.trim()) {
      filtered = filtered.filter(note =>
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.emotionalTone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Emotion filter
    if (emotions.length > 0) {
      filtered = filtered.filter(note =>
        note.tags?.some(tag => emotions.includes(tag))
      );
    }

    // Date filter
    if (startDate) {
      filtered = filtered.filter(note =>
        new Date(note.createdAt) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(note =>
        new Date(note.createdAt) <= new Date(endDate + 'T23:59:59')
      );
    }

    setFilteredNotes(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFilteredNotes((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const refreshNotes = async () => {
    // Force refresh - always fetch latest data
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        const newNotes = data.notes || [];
        setAllNotes(newNotes);
      }
    } catch (error) {
      console.error('Error refreshing notes:', error);
      // Fallback to full fetch
      fetchNotes();
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);
  const startIndex = (currentPage - 1) * notesPerPage;
  const endIndex = startIndex + notesPerPage;
  const currentNotes = filteredNotes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNotesPerPageChange = (newNotesPerPage: number) => {
    setNotesPerPage(newNotesPerPage);
    setCurrentPage(1); // Reset to first page
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <NoteListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchNotes}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (allNotes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Henüz hiç notun yok.
        </p>
        <p className="text-gray-500 dark:text-gray-500 mt-2">
          İlk notunu yazarak başla! 📝
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {allNotes.length >= 3 && <EmotionalTrends notes={allNotes} />}
      
      <SearchFilters
        availableEmotions={availableEmotions}
        onFiltersChange={handleFiltersChange}
      />
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Notların ({filteredNotes.length}{allNotes.length !== filteredNotes.length ? ` / ${allNotes.length}` : ''})
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Sayfa başına:
            </label>
            <select
              value={notesPerPage}
              onChange={(e) => handleNotesPerPageChange(Number(e.target.value))}
              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <button
            onClick={() => setIsDragMode(!isDragMode)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isDragMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {isDragMode ? 'Sıralama: Açık' : 'Sıralama: Kapalı'}
          </button>
        </div>
      </div>
      
      {filteredNotes.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-2xl mb-2">🔍</div>
          <p className="text-gray-600 dark:text-gray-400">
            Arama kriterlerinize uygun not bulunamadı
          </p>
        </div>
      ) : isDragMode ? (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext 
            items={currentNotes.map(note => note.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {currentNotes.map((note: Note) => (
                <SortableNoteCard 
                  key={note.id} 
                  note={note} 
                  onNoteUpdate={refreshNotes}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-4">
          {currentNotes.map((note: Note) => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onNoteUpdate={refreshNotes}
            />
          ))}
        </div>
      )}
      
      {/* Pagination Controls */}
      {filteredNotes.length > notesPerPage && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {startIndex + 1}-{Math.min(endIndex, filteredNotes.length)} / {filteredNotes.length} not gösteriliyor
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              ‹ Önceki
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Sonraki ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
