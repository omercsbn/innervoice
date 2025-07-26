export interface Note {
  id: string;
  content: string;
  mood?: string;
  emotionalTone?: string;
  aiAnalysis?: string;
  aiExpansion?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAnalysis {
  emotionalTone: string;
  mainEmotions: string[];
  moodScore: number; // -5 to +5 scale
  reflection: string;
  response: string;
  question?: string;
  counterNote?: string;
  suggestion?: string;
  motivation?: string;
}

export interface UserProfile {
  name?: string;
  age?: number;
  moodSnapshot?: string;
  pastReflections?: string[];
  struggles?: string[];
  mode: 'therapy' | 'mentor' | 'friend' | 'humorous';
}

export interface EmotionalInsight {
  date: string;
  averageMood: number;
  dominantEmotions: string[];
  noteCount: number;
  insights: string[];
}
