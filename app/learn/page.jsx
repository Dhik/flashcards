'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SwipeableCard } from '../../components/SwipeableCard.jsx';
import { updateCardProgress, getLocalData, getStats } from '../../lib/localStorage.js';
import { isDue, getPriority } from '../../lib/spacedRepetition.js';

export default function LearnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalReviewed: 0, knownWords: 0 });

  useEffect(() => {
    async function loadFlashcards() {
      const levelsParam = searchParams.get('levels');

      if (!levelsParam) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch(`/api/flashcards?levels=${levelsParam}&limit=100`);
        const data = await response.json();

        if (data.success) {
          // Sort by priority (due cards first)
          const localData = getLocalData();
          const sorted = data.data.sort((a, b) => {
            const priorityA = getPriority(a.id, localData.progress);
            const priorityB = getPriority(b.id, localData.progress);
            return priorityB - priorityA;
          });

          setFlashcards(sorted);
          setStats(getStats());
        }
      } catch (error) {
        console.error('Error loading flashcards:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFlashcards();
  }, [searchParams, router]);

  const handleSwipeLeft = (flashcard) => {
    // Don't know - mark as incorrect
    updateCardProgress(flashcard.id, 'again');
    setStats(getStats());
    moveToNext();
  };

  const handleSwipeRight = (flashcard) => {
    // Know it - mark as correct
    updateCardProgress(flashcard.id, 'good');
    setStats(getStats());
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more cards
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No flashcards available</h2>
          <p className="text-gray-600 mb-6">Please select some levels to study.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex / flashcards.length) * 100).toFixed(0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="w-full bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Back
          </button>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Card {currentIndex + 1} of {flashcards.length}
            </div>
            <div className="text-sm text-gray-600">
              Reviewed: {stats.totalReviewed}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Card Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="relative w-full max-w-2xl h-[70vh] max-h-[600px]">
          {currentCard && (
            <SwipeableCard
              key={currentCard.id}
              flashcard={currentCard}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="w-full bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-xl">←</span>
              <span>Swipe left: Don&apos;t know</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Tap: Flip card</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-xl">→</span>
              <span>Swipe right: Know it</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
