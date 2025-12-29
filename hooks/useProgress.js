import { useState, useEffect, useCallback } from 'react';
import {
  getCardProgress,
  updateCardProgress,
  getStats,
  getAllProgress,
} from '@/lib/localStorage';
import { calculateNextReview } from '@/lib/spacedRepetition';

export function useProgress() {
  const [stats, setStats] = useState({
    totalReviewed: 0,
    knownWords: 0,
    streak: 0,
    lastStudyDate: '',
  });

  // Load stats from localStorage
  useEffect(() => {
    setStats(getStats());
  }, []);

  // Update card progress and refresh stats
  const reviewCard = useCallback((flashcardId, knew) => {
    const currentProgress = getCardProgress(flashcardId);
    const newProgress = calculateNextReview(currentProgress, knew);

    updateCardProgress(flashcardId, newProgress);

    // Refresh stats
    setStats(getStats());

    return newProgress;
  }, []);

  // Get progress for a specific card
  const getProgress = useCallback((flashcardId) => {
    return getCardProgress(flashcardId);
  }, []);

  // Get all progress
  const getAllCardProgress = useCallback(() => {
    return getAllProgress();
  }, []);

  return {
    stats,
    reviewCard,
    getProgress,
    getAllCardProgress,
  };
}
