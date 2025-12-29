'use client';

import { motion } from 'framer-motion';
import { LEVEL_INFO } from '../lib/constants.js';

export function LevelSelector({
  selectedLevels,
  onLevelToggle,
  cardCounts,
  onGenerateAI,
  generatingLevel,
}) {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
      {levels.map((level) => {
        const isSelected = selectedLevels.includes(level);
        const info = LEVEL_INFO[level];
        const count = cardCounts?.[level] || 0;
        const isGenerating = generatingLevel === level;

        return (
          <div key={level} className="relative">
            <motion.button
              onClick={() => onLevelToggle(level)}
              className={`relative p-6 rounded-2xl shadow-lg transition-all w-full ${
                isSelected
                  ? 'ring-4 ring-blue-400 scale-105'
                  : 'hover:scale-105'
              }`}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${getGradientColors(level)})`
                  : '#f3f4f6',
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-2xl font-bold ${
                      isSelected ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {level}
                  </span>
                  {isSelected && (
                    <span className="text-white text-xl">✓</span>
                  )}
                </div>

                <span
                  className={`text-sm font-medium ${
                    isSelected ? 'text-white/90' : 'text-gray-600'
                  }`}
                >
                  {info.name}
                </span>

                <p
                  className={`text-xs leading-tight ${
                    isSelected ? 'text-white/80' : 'text-gray-500'
                  }`}
                >
                  {info.description}
                </p>

                {count > 0 && (
                  <div
                    className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {count} words
                  </div>
                )}
              </div>
            </motion.button>

            {/* Generate AI Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGenerateAI?.(level);
              }}
              disabled={isGenerating}
              className={`mt-2 w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                isGenerating
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                '✨ Generate AI Cards'
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function getGradientColors(level) {
  const gradients = {
    A1: '#10b981, #059669',
    A2: '#84cc16, #65a30d',
    B1: '#eab308, #ca8a04',
    B2: '#f97316, #ea580c',
    C1: '#ef4444, #dc2626',
    C2: '#a855f7, #9333ea',
  };
  return gradients[level];
}
