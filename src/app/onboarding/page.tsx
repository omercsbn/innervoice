'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { Heart, Sparkles, User, Smile, Brain, Coffee } from 'lucide-react';

interface OnboardingData {
  name?: string;
  age?: number;
  interests: string[];
  mood: 'therapy' | 'mentor' | 'friend' | 'humorous';
  personalityTraits: string[];
  communicationStyle: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    interests: [],
    mood: 'friend',
    personalityTraits: [],
    communicationStyle: 'casual'
  });

  const interests = [
    '🎵 Müzik', '📚 Kitap', '🎬 Film', '🎮 Oyun', '✈️ Seyahat',
    '🍳 Yemek', '💪 Spor', '🎨 Sanat', '🌱 Doğa', '💻 Teknoloji',
    '📱 Sosyal Medya', '🧘‍♀️ Meditasyon', '📝 Yazı', '🎭 Tiyatro'
  ];

  const personalityTraits = [
    '😊 Optimist', '🤔 Düşünceli', '🎉 Sosyal', '📖 İçe dönük',
    '🎯 Hedef odaklı', '🌊 Sakin', '⚡ Enerjik', '💭 Yaratıcı',
    '🤗 Empatik', '🔍 Meraklı', '😴 Rahat', '🎪 Eğlenceli'
  ];

  const toggleSelection = (item: string, field: 'interests' | 'personalityTraits') => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save to localStorage and redirect
      localStorage.setItem('innervoice_profile', JSON.stringify(data));
      router.push('/app');
    }
  };

  const handleSkip = () => {
    // Save minimal profile and redirect
    const minimalProfile = {
      name: data.name || 'Kullanıcı',
      age: data.age || 25,
      interests: [],
      mood: 'friend',
      personalityTraits: [],
      communicationStyle: 'casual'
    };
    localStorage.setItem('innervoice_profile', JSON.stringify(minimalProfile));
    router.push('/app');
  };

  const canContinue = () => {
    switch (step) {
      case 1: return true; // Name is optional
      case 2: return data.interests.length > 0;
      case 3: return data.personalityTraits.length > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <button
            onClick={handleSkip}
            className="absolute top-0 right-0 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Atla →
          </button>
          
          <div className="absolute top-0 left-0">
            <ThemeToggle />
          </div>
          
          <div className="text-6xl mb-4">🧘‍♂️</div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            InnerVoice'a Hoşgeldin!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Seni daha iyi tanıyalım 💫
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {i}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="max-w-2xl mx-auto flex-1">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  Kendini Tanıt
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adın ne? (isteğe bağlı)
                  </label>
                  <input
                    type="text"
                    value={data.name || ''}
                    onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Örn: Ahmet, Ayşe..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yaşın kaç? (isteğe bağlı)
                  </label>
                  <input
                    type="number"
                    value={data.age || ''}
                    onChange={(e) => setData(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                    placeholder="25"
                    min="13"
                    max="100"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    AI nasıl seninle konuşsun?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'friend', icon: '🤗', label: 'Arkadaş Gibi', desc: 'Samimi ve rahat' },
                      { value: 'mentor', icon: '🧠', label: 'Mentor Gibi', desc: 'Yönlendirici ve bilge' },
                      { value: 'therapy', icon: '💚', label: 'Terapist Gibi', desc: 'Anlayışlı ve destekleyici' },
                      { value: 'humorous', icon: '😄', label: 'Eğlenceli', desc: 'Mizahi ve neşeli' }
                    ].map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setData(prev => ({ ...prev, mood: mood.value as any }))}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          data.mood === mood.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="text-2xl mb-1">{mood.icon}</div>
                        <div className="font-medium text-gray-800 dark:text-white">{mood.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{mood.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-pink-600" />
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  Nelerden Hoşlanırsın?
                </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                İlgi alanlarını seç ki seni daha iyi anlayabilelim 💕
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleSelection(interest, 'interests')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      data.interests.includes(interest)
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-gray-800 dark:text-white">
                      {interest}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {data.interests.length > 0 
                  ? `${data.interests.length} ilgi alanı seçtiniz` 
                  : 'En az 1 ilgi alanı seçin'
                }
              </div>
            </div>
          )}

          {/* Step 3: Personality */}
          {step === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  Kişiliğin Nasıl?
                </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Kendini en iyi tanımlayan özellikleri seç ✨
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {personalityTraits.map((trait) => (
                  <button
                    key={trait}
                    onClick={() => toggleSelection(trait, 'personalityTraits')}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      data.personalityTraits.includes(trait)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-gray-800 dark:text-white">
                      {trait}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {data.personalityTraits.length > 0
                  ? `${data.personalityTraits.length} özellik seçtiniz`
                  : 'En az 1 kişilik özelliği seçin'
                }
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              ← Geri
            </button>

            <button
              onClick={handleContinue}
              disabled={!canContinue()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {step === 3 ? (
                <>
                  <Coffee className="w-4 h-4" />
                  Başlayalım!
                </>
              ) : (
                <>
                  Devam Et
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Skip option */}
          <div className="text-center mt-4">
            <button
              onClick={() => router.push('/app')}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Şimdilik geç, direkt başla →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
