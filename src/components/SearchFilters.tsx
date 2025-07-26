'use client';

import { useState } from 'react';
import { Search, Filter, Calendar, Heart, X } from 'lucide-react';

interface SearchFiltersProps {
  onFiltersChange: (searchQuery: string, emotions: string[], startDate: string, endDate: string) => void;
  availableEmotions: string[];
}

export default function SearchFilters({ 
  onFiltersChange, 
  availableEmotions 
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onFiltersChange(query, selectedEmotions, startDate, endDate);
  };

  const toggleEmotion = (emotion: string) => {
    const newEmotions = selectedEmotions.includes(emotion)
      ? selectedEmotions.filter(e => e !== emotion)
      : [...selectedEmotions, emotion];
    
    setSelectedEmotions(newEmotions);
    onFiltersChange(searchQuery, newEmotions, startDate, endDate);
  };

  const handleDateFilter = () => {
    onFiltersChange(searchQuery, selectedEmotions, startDate, endDate);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedEmotions([]);
    setStartDate('');
    setEndDate('');
    onFiltersChange('', [], '', '');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Notlarında ara..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            showFilters || selectedEmotions.length > 0 || startDate || endDate
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtre
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Emotion Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Duygulara Göre Filtrele
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableEmotions.map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => toggleEmotion(emotion)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedEmotions.includes(emotion)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Tarih Aralığı
            </h3>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <span className="flex items-center text-gray-500 dark:text-gray-400">→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleDateFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Uygula
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedEmotions.length > 0 || startDate || endDate) && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
