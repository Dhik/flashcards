'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LevelSelector } from '../components/LevelSelector.jsx';
import { getSettings, updatePreferredLevels, getStats } from '../lib/localStorage.js';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [stats, setStats] = useState({ totalReviewed: 0, knownWords: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [cardCounts, setCardCounts] = useState({});
  const [generatingLevel, setGeneratingLevel] = useState(null);

  useEffect(() => {
    // Load saved preferences
    const settings = getSettings();
    setSelectedLevels(settings.preferredLevels);

    // Load stats
    const userStats = getStats();
    setStats({
      totalReviewed: userStats.totalReviewed,
      knownWords: userStats.knownWords,
    });

    // Load card counts
    loadCardCounts();

    setIsLoading(false);
  }, []);

  const loadCardCounts = async () => {
    try {
      const response = await fetch('/api/flashcards/count');
      const data = await response.json();
      if (data.success) {
        setCardCounts(data.counts);
      }
    } catch (error) {
      console.error('Error loading card counts:', error);
    }
  };

  const handleGenerateAI = async (level) => {
    if (generatingLevel) {
      alert('Please wait for the current generation to complete.');
      return;
    }

    const confirmed = confirm(
      `Generate 50 new AI-powered flashcards for level ${level}?`
    );

    if (!confirmed) return;

    setGeneratingLevel(level);

    try {
      const response = await fetch('/api/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, count: 50 }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `✅ Successfully generated ${data.generated} flashcards!\n💾 Saved ${data.saved} new cards to database.`
        );
        // Reload card counts
        await loadCardCounts();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert(`❌ Failed to generate flashcards: ${error.message}`);
    } finally {
      setGeneratingLevel(null);
    }
  };

  const handleLevelToggle = (level) => {
    setSelectedLevels((prev) => {
      const newLevels = prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level];

      // Save to localStorage
      updatePreferredLevels(newLevels);
      return newLevels;
    });
  };

  const handleStartLearning = () => {
    if (selectedLevels.length === 0) {
      alert('Please select at least one level!');
      return;
    }

    // Navigate to learning page with selected levels
    router.push(`/learn?levels=${selectedLevels.join(',')}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 md:p-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
          FlashCards
        </h1>
        <p className="text-gray-600 text-lg md:text-xl">
          Master English vocabulary with smart spaced repetition
        </p>
      </motion.div>

      {/* Stats Section */}
      {stats.totalReviewed > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center gap-8 mb-12"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">
              {stats.totalReviewed}
            </div>
            <div className="text-sm text-gray-500">Reviewed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">
              {stats.knownWords}
            </div>
            <div className="text-sm text-gray-500">Known</div>
          </div>
        </motion.div>
      )}

      {/* Level Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto w-full mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Choose Your Level
        </h2>
        <LevelSelector
          selectedLevels={selectedLevels}
          onLevelToggle={handleLevelToggle}
          cardCounts={cardCounts}
          onGenerateAI={handleGenerateAI}
          generatingLevel={generatingLevel}
        />
      </motion.div>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="fixed bottom-8 left-0 right-0 flex justify-center px-6"
      >
        <button
          onClick={handleStartLearning}
          disabled={selectedLevels.length === 0}
          className={`w-full max-w-md py-4 px-8 rounded-2xl font-bold text-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
            selectedLevels.length > 0
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-blue-500/50'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedLevels.length > 0
            ? `Start Learning (${selectedLevels.length} ${
                selectedLevels.length === 1 ? 'level' : 'levels'
              })`
            : 'Select a Level First'}
        </button>
      </motion.div>

      {/* Navigation to Stats */}
      {stats.totalReviewed > 0 && (
        <button
          onClick={() => router.push('/stats')}
          className="fixed top-6 right-6 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
