import { NextRequest, NextResponse } from 'next/server';
import { noteOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emotion = searchParams.get('emotion');
    const noteId = searchParams.get('excludeId');
    
    if (!emotion) {
      return NextResponse.json(
        { error: 'Emotion parameter is required' },
        { status: 400 }
      );
    }

    // Get all notes
    const allNotes = noteOperations.findAll(100, 0);
    
    // Filter notes with similar emotions
    const relatedNotes = allNotes
      .filter(note => {
        // Exclude the current note
        if (noteId && note.id === noteId) return false;
        
        // Check if note has the emotion in tags
        return note.tags?.includes(emotion);
      })
      .slice(0, 5); // Limit to 5 related notes

    return NextResponse.json({ 
      relatedNotes,
      emotion,
      count: relatedNotes.length
    });
  } catch (error) {
    console.error('Error finding related notes:', error);
    return NextResponse.json(
      { error: 'Failed to find related notes' },
      { status: 500 }
    );
  }
}
