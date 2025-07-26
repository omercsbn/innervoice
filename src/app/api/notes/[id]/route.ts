import { NextRequest, NextResponse } from 'next/server';
import { noteOperations } from '@/lib/database';
import { AIService } from '@/lib/ai-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { content, userProfile } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Not içeriği gerekli' },
        { status: 400 }
      );
    }

    // Check if note exists
    const existingNote = noteOperations.findById(id);
    if (!existingNote) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    // Update note content first
    const result = noteOperations.update(id, { content: content.trim() });

    if (!result) {
      return NextResponse.json(
        { error: 'Not güncellenirken hata oluştu' },
        { status: 500 }
      );
    }

    // Get AI re-analysis for updated content
    try {
      const aiService = AIService.getInstance();
      const previousNotes = noteOperations.findAll(10, 0);
      
      // Re-analyze updated content
      const analysis = await aiService.analyzeNote(content.trim(), userProfile, previousNotes);
      
      // Update note with new AI analysis
      noteOperations.update(id, {
        emotionalTone: analysis.emotionalTone,
        aiAnalysis: JSON.stringify(analysis),
        tags: analysis.mainEmotions || []
      });
    } catch (aiError) {
      console.error('AI analysis failed during update:', aiError);
      // Continue without AI analysis - note content is still updated
    }

    // Get updated note with new analysis
    const updatedNote = noteOperations.findById(id);

    return NextResponse.json({ 
      success: true,
      note: updatedNote
    });

  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Not güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if note exists
    const existingNote = noteOperations.findById(id);
    if (!existingNote) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    // Delete note
    const result = noteOperations.delete(id);

    if (!result) {
      return NextResponse.json(
        { error: 'Not silinirken hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Not başarıyla silindi'
    });

  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Not silinirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const note = noteOperations.findById(id);

    if (!note) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      note
    });

  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Not yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
