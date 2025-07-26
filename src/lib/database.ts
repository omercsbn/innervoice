import Database from 'better-sqlite3';
import path from 'path';
import { Note } from '@/types';

const dbPath = path.join(process.cwd(), 'data', 'innervoice.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initializeDatabase() {
  // Create data directory if it doesn't exist
  const fs = require('fs'); // eslint-disable-line @typescript-eslint/no-require-imports
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      mood TEXT,
      emotional_tone TEXT,
      ai_analysis TEXT,
      ai_expansion TEXT,
      tags TEXT, -- JSON array as string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create user_profile table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY,
      name TEXT,
      age INTEGER,
      mood_snapshot TEXT,
      past_reflections TEXT, -- JSON array as string
      struggles TEXT, -- JSON array as string
      mode TEXT DEFAULT 'friend',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Note operations
export const noteOperations = {
  create: (note: Omit<Note, 'createdAt' | 'updatedAt'>) => {
    const stmt = db.prepare(`
      INSERT INTO notes (id, content, mood, emotional_tone, ai_analysis, ai_expansion, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      note.id,
      note.content,
      note.mood || null,
      note.emotionalTone || null,
      note.aiAnalysis || null,
      note.aiExpansion || null,
      note.tags ? JSON.stringify(note.tags) : null
    );
  },

  findById: (id: string): Note | null => {
    const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
    const row = stmt.get(id) as unknown; // eslint-disable-line @typescript-eslint/no-explicit-any
    
    if (!row) return null;
    
    const dbRow = row as {
      id: string;
      content: string;
      mood: string | null;
      emotional_tone: string | null;
      ai_analysis: string | null;
      ai_expansion: string | null;
      tags: string | null;
      created_at: string;
      updated_at: string;
    };
    
    return {
      id: dbRow.id,
      content: dbRow.content,
      mood: dbRow.mood || undefined,
      emotionalTone: dbRow.emotional_tone || undefined,
      aiAnalysis: dbRow.ai_analysis || undefined,
      aiExpansion: dbRow.ai_expansion || undefined,
      tags: dbRow.tags ? JSON.parse(dbRow.tags) : [],
      createdAt: new Date(dbRow.created_at),
      updatedAt: new Date(dbRow.updated_at)
    };
  },

  findAll: (limit = 50, offset = 0): Note[] => {
    const stmt = db.prepare(`
      SELECT * FROM notes 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `);
    const rows = stmt.all(limit, offset) as unknown[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    
    return rows.map((row) => {
      const dbRow = row as {
        id: string;
        content: string;
        mood: string | null;
        emotional_tone: string | null;
        ai_analysis: string | null;
        ai_expansion: string | null;
        tags: string | null;
        created_at: string;
        updated_at: string;
      };
      
      return {
        id: dbRow.id,
        content: dbRow.content,
        mood: dbRow.mood || undefined,
        emotionalTone: dbRow.emotional_tone || undefined,
        aiAnalysis: dbRow.ai_analysis || undefined,
        aiExpansion: dbRow.ai_expansion || undefined,
        tags: dbRow.tags ? JSON.parse(dbRow.tags) : [],
        createdAt: new Date(dbRow.created_at),
        updatedAt: new Date(dbRow.updated_at)
      };
    });
  },

  update: (id: string, updates: Partial<Note>) => {
    const setClause = [];
    const values = [];
    
    if (updates.content !== undefined) {
      setClause.push('content = ?');
      values.push(updates.content);
    }
    if (updates.mood !== undefined) {
      setClause.push('mood = ?');
      values.push(updates.mood);
    }
    if (updates.emotionalTone !== undefined) {
      setClause.push('emotional_tone = ?');
      values.push(updates.emotionalTone);
    }
    if (updates.aiAnalysis !== undefined) {
      setClause.push('ai_analysis = ?');
      values.push(updates.aiAnalysis);
    }
    if (updates.aiExpansion !== undefined) {
      setClause.push('ai_expansion = ?');
      values.push(updates.aiExpansion);
    }
    if (updates.tags !== undefined) {
      setClause.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }
    
    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE notes 
      SET ${setClause.join(', ')} 
      WHERE id = ?
    `);
    
    return stmt.run(...values);
  },

  delete: (id: string) => {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    return stmt.run(id);
  }
};

// Initialize database on import
initializeDatabase();

export default db;
