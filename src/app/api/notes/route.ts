import { NextRequest, NextResponse } from 'next/server';
import { noteOperations } from '@/lib/database';
import { AIService } from '@/lib/ai-service';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const notes = noteOperations.findAll();
    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, userProfile } = await request.json();
    
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      );
    }

    const noteId = uuidv4();
    
    // Create the note first
    const note = {
      id: noteId,
      content: content.trim(),
    };
    
    noteOperations.create(note);
    
    // Get previous notes for context (last 10 notes)
    const previousNotes = noteOperations.findAll(10, 0);
    
    // Get AI analysis with user profile and context
    const aiService = AIService.getInstance();
    const analysis = await aiService.analyzeNote(content, userProfile, previousNotes);
    
    // Get AI expansion
    const expansion = await aiService.expandNote(content, analysis);
    
    // Update note with AI analysis
    noteOperations.update(noteId, {
      emotionalTone: analysis.emotionalTone,
      aiAnalysis: JSON.stringify(analysis),
      aiExpansion: expansion,
      tags: analysis.mainEmotions
    });
    
    // Return the updated note
    const updatedNote = noteOperations.findById(noteId);
    
    return NextResponse.json({ 
      note: updatedNote,
      analysis 
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
