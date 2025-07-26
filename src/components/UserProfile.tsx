'use client';

import { useState, useEffect } from 'react';
import { UserProfile as UserProfileType, Note } from '@/types';
import { User, Heart, Brain, X, Edit2 } from 'lucide-react';

interface UserProfileProps {
  profile: UserProfileType;
  onClose: () => void;
}

export default function UserProfile({ profile, onClose }: UserProfileProps) {
  const [stats, setStats] = useState({
    totalNotes: 0,
    thisWeek: 0,
    averageMood: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        const notes: Note[] = data.notes || [];
        
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const thisWeekNotes = notes.filter(note => 
          new Date(note.createdAt) >= oneWeekAgo
        );

        // Calculate average mood from AI analysis
        let totalMoodScore = 0;
        let moodCount = 0;
        
        notes.forEach(note => {
          if (note.aiAnalysis) {
            try {
              const analysis = JSON.parse(note.aiAnalysis);
              if (analysis.moodScore !== undefined) {
                totalMoodScore += analysis.moodScore;
                moodCount++;
              }
            } catch (error) {
              // Ignore parsing errors
            }
          }
        });

        const averageMood = moodCount > 0 ? totalMoodScore / moodCount : 0;

        setStats({
          totalNotes: notes.length,
          thisWeek: thisWeekNotes.length,
          averageMood: Math.round(averageMood * 10) / 10
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'therapy': return '💚';
      case 'mentor': return '🧠';
      case 'humorous': return '😄';
      default: return '🤗';
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'therapy': return 'Terapist Modu';
      case 'mentor': return 'Mentor Modu';
      case 'humorous': return 'Eğlenceli Modu';
      default: return 'Arkadaş Modu';
    }
  };

  const handleEditProfile = () => {
    window.location.href = '/onboarding';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl text-white">
          {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {profile.name ? `Merhaba ${profile.name}!` : 'Merhaba!'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {profile.age && `${profile.age} yaşında • `}
            {getModeLabel(profile.mode)}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Mode */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-800 dark:text-white">AI Konuşma Tarzı</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getModeIcon(profile.mode)}</span>
            <span className="text-gray-700 dark:text-gray-300">{getModeLabel(profile.mode)}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {profile.mode === 'therapy' && 'Anlayışlı ve destekleyici yaklaşım'}
            {profile.mode === 'mentor' && 'Yönlendirici ve bilge tavırlar'}
            {profile.mode === 'humorous' && 'Mizahi ve neşeli konuşmalar'}
            {profile.mode === 'friend' && 'Samimi ve rahat sohbetler'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-purple-600" />
            <h3 className="font-medium text-gray-800 dark:text-white">Gelişim İstatistikleri</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Toplam Not:</span>
              <span className="font-medium text-gray-800 dark:text-white">{stats.totalNotes}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Bu Hafta:</span>
              <span className="font-medium text-gray-800 dark:text-white">{stats.thisWeek}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Ortalama Ruh Hali:</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {stats.averageMood > 0 ? `+${stats.averageMood}` : stats.averageMood || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleEditProfile}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Profili Düzenle
        </button>
      </div>
    </div>
  );
}
