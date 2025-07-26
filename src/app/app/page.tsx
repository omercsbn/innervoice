'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NoteInput from '@/components/NoteInput';
import NotesList from '@/components/NotesList';
import UserProfile from '@/components/UserProfile';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import ThemeToggle from '@/components/ThemeToggle';
import MindMap from '@/components/MindMap';
import { UserProfile as UserProfileType, Note } from '@/types';

export default function AppPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState<'notes' | 'mindmap'>('notes');

  useEffect(() => {
    // Check if user has completed onboarding
    const profileData = localStorage.getItem('innervoice_profile');
    if (!profileData) {
      router.push('/onboarding');
      return;
    }

    try {
      const profile = JSON.parse(profileData);
      setUserProfile({
        name: profile.name,
        age: profile.age,
        mode: profile.mood || 'friend',
        pastReflections: [],
        struggles: []
      });
    } catch (error) {
      console.error('Error parsing user profile:', error);
      router.push('/onboarding');
    }
  }, [router]);

  useEffect(() => {
    // Fetch notes for analytics
    const fetchNotes = async () => {
      try {
        const response = await fetch('/api/notes');
        if (response.ok) {
          const data = await response.json();
          setNotes(data.notes || []);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, []);

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧘‍♂️</div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                🧘‍♂️ InnerVoice
              </h1>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {userProfile?.name ? `Merhaba ${userProfile.name}` : 'Profil'} 👋
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  showAnalytics 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                📊 Analitik
              </button>
              
              <ThemeToggle />
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Kişisel Duygu Analizi ve İçsel Diyalog Asistanı
          </p>
        </header>

        {showProfile && (
          <div className="max-w-4xl mx-auto mb-8">
            <UserProfile 
              profile={userProfile} 
              onClose={() => setShowProfile(false)}
            />
          </div>
        )}

        {showAnalytics && notes.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <AnalyticsDashboard notes={notes} />
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <NoteInput userProfile={userProfile} />
          </div>
          
          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                📝 Notlarım
              </button>
              <button
                onClick={() => setActiveTab('mindmap')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'mindmap'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                🧠 Mind Map
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div>
            {activeTab === 'notes' ? (
              <NotesList />
            ) : (
              <MindMap notes={notes} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
