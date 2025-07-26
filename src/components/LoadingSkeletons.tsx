'use client';

import { motion } from 'framer-motion';

export function NoteSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        
        {/* Content */}
        <div className="space-y-3 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
        
        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    </motion.div>
  );
}

export function TrendsSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
        
        {/* Chart area */}
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ProfileSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="animate-pulse">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-12 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16 mx-auto"></div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-12 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16 mx-auto"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function NoteListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <NoteSkeleton key={index} />
      ))}
    </div>
  );
}
