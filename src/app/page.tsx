'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has completed onboarding
    const profileData = localStorage.getItem('innervoice_profile');
    if (profileData) {
      router.push('/app');
    } else {
      router.push('/onboarding');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🧘‍♂️</div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          InnerVoice
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Yönlendiriliyor...
        </p>
      </div>
    </div>
  );
}
