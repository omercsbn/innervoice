'use client';

import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Note } from '@/types';
import NoteCard from './NoteCard';

interface SortableNoteCardProps {
  note: Note;
  onNoteUpdate?: () => void;
}

export default function SortableNoteCard({ note, onNoteUpdate }: SortableNoteCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative"
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-4 p-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>
        
        <div className="flex-1">
          <NoteCard note={note} onNoteUpdate={onNoteUpdate} />
        </div>
      </div>
    </div>
  );
}
