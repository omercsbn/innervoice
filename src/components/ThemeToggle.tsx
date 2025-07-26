'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    console.log('ThemeToggle mounted. Current theme:', theme, 'Resolved:', resolvedTheme);
  }, []);

  useEffect(() => {
    if (mounted) {
      console.log('Theme changed to:', theme, 'Resolved:', resolvedTheme);
    }
  }, [theme, resolvedTheme, mounted]);

  const handleThemeChange = (newTheme: string) => {
    console.log('Setting theme to:', newTheme);
    setTheme(newTheme);
  };

  if (!mounted) {
    // Loading state with similar dimensions
    return (
      <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
      </div>
    );
  }

  const themes = [
    { key: 'light', icon: Sun, label: 'Açık Tema' },
    { key: 'system', icon: Monitor, label: 'Sistem Teması' },
    { key: 'dark', icon: Moon, label: 'Koyu Tema' }
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
      {themes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => handleThemeChange(key)}
          title={label}
          className={`p-2 rounded-md transition-all duration-200 ${
            theme === key
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm ring-2 ring-blue-500 dark:ring-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}
