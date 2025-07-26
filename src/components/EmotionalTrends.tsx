'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

interface EmotionalTrendsProps {
  notes: Note[];
}

export default function EmotionalTrends({ notes }: EmotionalTrendsProps) {
  const [trends, setTrends] = useState<{
    currentWeek: Record<string, number>;
    lastWeek: Record<string, number>;
    trending: string[];
    declining: string[];
  } | null>(null);

  useEffect(() => {
    if (notes.length > 0) {
      analyzeTrends();
    }
  }, [notes]);

  const analyzeTrends = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Current week notes
    const currentWeekNotes = notes.filter(note => 
      new Date(note.createdAt) >= oneWeekAgo
    );

    // Last week notes
    const lastWeekNotes = notes.filter(note => {
      const noteDate = new Date(note.createdAt);
      return noteDate >= twoWeeksAgo && noteDate < oneWeekAgo;
    });

    // Count emotions
    const countEmotions = (notesList: Note[]) => {
      const counts: Record<string, number> = {};
      notesList.forEach(note => {
        note.tags?.forEach(emotion => {
          if (emotion) {
            counts[emotion] = (counts[emotion] || 0) + 1;
          }
        });
      });
      return counts;
    };

    const currentWeek = countEmotions(currentWeekNotes);
    const lastWeek = countEmotions(lastWeekNotes);

    // Find trending emotions
    const trending: string[] = [];
    const declining: string[] = [];

    Object.keys(currentWeek).forEach(emotion => {
      const current = currentWeek[emotion] || 0;
      const previous = lastWeek[emotion] || 0;
      
      if (current > previous && current >= 2) {
        trending.push(emotion);
      } else if (previous > current && previous >= 2) {
        declining.push(emotion);
      }
    });

    setTrends({
      currentWeek,
      lastWeek,
      trending: trending.slice(0, 3),
      declining: declining.slice(0, 3)
    });
  };

  if (!trends || notes.length < 3) {
    return null;
  }

  const topEmotions = Object.entries(trends.currentWeek)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Duygusal Trendler
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Emotions This Week */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
            Bu Hafta En Çok Hissedilenler
          </h3>
          <div className="space-y-2">
            {topEmotions.map(([emotion, count]) => (
              <div key={emotion} className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">{emotion}</span>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${Math.min(100, (count / Math.max(...Object.values(trends.currentWeek))) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trends */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
            Değişimler
          </h3>
          <div className="space-y-3">
            {trends.trending.length > 0 && (
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-green-800 dark:text-green-400">
                    Artan Duygular
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {trends.trending.join(', ')}
                  </div>
                </div>
              </div>
            )}

            {trends.declining.length > 0 && (
              <div className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-400">
                    Azalan Duygular
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {trends.declining.join(', ')}
                  </div>
                </div>
              </div>
            )}

            {trends.trending.length === 0 && trends.declining.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Bu hafta duygusal durumun oldukça istikrarlı görünüyor.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          Son 2 haftalık veriye dayalı analiz
        </div>
      </div>
    </div>
  );
}
