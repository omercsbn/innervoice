'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Heart,
  Brain,
  Target
} from 'lucide-react';
import { Note } from '@/types';

interface AnalyticsDashboardProps {
  notes: Note[];
}

interface AnalyticsData {
  totalNotes: number;
  weeklyAverage: number;
  mostCommonEmotion: string;
  moodTrend: 'up' | 'down' | 'stable';
  averageMoodScore: number;
  streakDays: number;
  emotionDistribution: { [key: string]: number };
  weeklyActivity: number[];
}

export default function AnalyticsDashboard({ notes }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (notes.length > 0) {
      calculateAnalytics();
    }
  }, [notes]);

  const calculateAnalytics = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentNotes = notes.filter(note => new Date(note.createdAt) >= oneWeekAgo);
    
    // Calculate emotions distribution
    const emotionCount: { [key: string]: number } = {};
    let totalMoodScore = 0;
    let moodScoreCount = 0;
    
    notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => {
          if (tag) {
            emotionCount[tag] = (emotionCount[tag] || 0) + 1;
          }
        });
      }
      
      if (note.aiAnalysis) {
        try {
          const analysis = JSON.parse(note.aiAnalysis);
          if (analysis.moodScore !== undefined) {
            totalMoodScore += analysis.moodScore;
            moodScoreCount++;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    const mostCommonEmotion = Object.keys(emotionCount).reduce((a, b) => 
      emotionCount[a] > emotionCount[b] ? a : b, Object.keys(emotionCount)[0] || 'Belirsiz'
    );

    // Calculate weekly activity
    const weeklyActivity = Array(7).fill(0);
    recentNotes.forEach(note => {
      const dayIndex = new Date(note.createdAt).getDay();
      weeklyActivity[dayIndex]++;
    });

    // Calculate streak (simplified)
    let streakDays = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
    
    if (notes.some(note => new Date(note.createdAt).toDateString() === today)) {
      streakDays = 1;
      // Could be extended to calculate actual streak
    }

    setAnalytics({
      totalNotes: notes.length,
      weeklyAverage: Math.round(recentNotes.length / 7 * 10) / 10,
      mostCommonEmotion,
      moodTrend: 'stable', // Simplified
      averageMoodScore: moodScoreCount > 0 ? Math.round(totalMoodScore / moodScoreCount * 10) / 10 : 0,
      streakDays,
      emotionDistribution: emotionCount,
      weeklyActivity
    });
  };

  if (!analytics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Toplam Not',
      value: analytics.totalNotes,
      icon: BarChart3,
      color: 'blue'
    },
    {
      title: 'Haftalık Ortalama',
      value: analytics.weeklyAverage,
      icon: Calendar,
      color: 'green'
    },
    {
      title: 'En Sık Duygu',
      value: analytics.mostCommonEmotion,
      icon: Heart,
      color: 'pink'
    },
    {
      title: 'Ortalama Ruh Hali',
      value: analytics.averageMoodScore,
      icon: Brain,
      color: 'purple'
    },
    {
      title: 'Günlük Seri',
      value: `${analytics.streakDays} gün`,
      icon: Target,
      color: 'orange'
    },
    {
      title: 'Haftalık Trend',
      value: analytics.moodTrend === 'up' ? '↗️' : analytics.moodTrend === 'down' ? '↘️' : '→',
      icon: TrendingUp,
      color: 'indigo'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Duygusal Analitik
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg ${getColorClasses(stat.color)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{stat.title}</span>
            </div>
            <div className="text-lg font-bold">
              {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Emotion Distribution */}
      {Object.keys(analytics.emotionDistribution).length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Duygu Dağılımı
          </h3>
          <div className="space-y-2">
            {Object.entries(analytics.emotionDistribution)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([emotion, count]) => {
                const percentage = (count / analytics.totalNotes) * 100;
                return (
                  <div key={emotion} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-20 truncate">
                      {emotion}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.5 }}
                        className="bg-blue-500 h-2 rounded-full"
                      />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-8">
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
