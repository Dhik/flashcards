import { getInitialProgress } from './spacedRepetition.js';

const STORAGE_KEY = 'flashcards-progress';

const DEFAULT_DATA = {
  progress: {},
  settings: {
    dailyGoal: 20,
    preferredLevels: ['A1', 'A2'],
  },
  stats: {
    totalReviewed: 0,
    knownWords: 0,
    streak: 0,
    lastStudyDate: '',
  },
};

/**
 * Get all data from localStorage
 * @returns {Object} LocalStorage data
 */
export function getLocalData() {
  if (typeof window === 'undefined') return DEFAULT_DATA;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_DATA;

    const data = JSON.parse(stored);
    return {
      ...DEFAULT_DATA,
      ...data,
      settings: { ...DEFAULT_DATA.settings, ...data.settings },
      stats: { ...DEFAULT_DATA.stats, ...data.stats },
    };
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return DEFAULT_DATA;
  }
}

/**
 * Save all data to localStorage
 * @param {Object} data - Data to save
 */
export function saveLocalData(data) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Get progress for a specific flashcard
 * @param {string} flashcardId - Flashcard ID
 * @returns {Object} Card progress
 */
export function getCardProgress(flashcardId) {
  const data = getLocalData();
  return data.progress[flashcardId] || getInitialProgress();
}

/**
 * Update progress for a specific flashcard
 * @param {string} flashcardId - Flashcard ID
 * @param {Object} progress - Progress object
 */
export function updateCardProgress(flashcardId, progress) {
  const data = getLocalData();
  data.progress[flashcardId] = progress;

  // Update stats
  data.stats.totalReviewed += 1;
  data.stats.lastStudyDate = new Date().toISOString();

  // Count known words
  const knownWords = Object.values(data.progress).filter(
    (p) => p.status === 'known'
  ).length;
  data.stats.knownWords = knownWords;

  saveLocalData(data);
}

/**
 * Get all progress data
 * @returns {Object} All progress
 */
export function getAllProgress() {
  return getLocalData().progress;
}

/**
 * Get user settings
 * @returns {Object} User settings
 */
export function getSettings() {
  return getLocalData().settings;
}

/**
 * Update user settings
 * @param {Object} settings - Settings to update
 */
export function updateSettings(settings) {
  const data = getLocalData();
  data.settings = { ...data.settings, ...settings };
  saveLocalData(data);
}

/**
 * Get user stats
 * @returns {Object} User stats
 */
export function getStats() {
  return getLocalData().stats;
}

/**
 * Update preferred levels
 * @param {Array<string>} levels - CEFR levels array
 */
export function updatePreferredLevels(levels) {
  const data = getLocalData();
  data.settings.preferredLevels = levels;
  saveLocalData(data);
}

/**
 * Get cards due for review
 * @returns {Array<string>} Array of card IDs
 */
export function getDueCardIds() {
  const data = getLocalData();
  const now = Date.now();

  return Object.entries(data.progress)
    .filter(([_, progress]) => progress.nextReview <= now)
    .map(([id, _]) => id);
}

/**
 * Get new cards (never studied)
 * @param {Array<string>} allCardIds - All card IDs
 * @returns {number} Count of new cards
 */
export function getNewCardCount(allCardIds) {
  const data = getLocalData();
  return allCardIds.filter((id) => !data.progress[id]).length;
}

/**
 * Clear all progress (reset)
 */
export function clearAllProgress() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export progress as JSON
 * @returns {string} JSON string
 */
export function exportProgress() {
  const data = getLocalData();
  return JSON.stringify(data, null, 2);
}

/**
 * Import progress from JSON
 * @param {string} jsonString - JSON string to import
 * @returns {boolean} Success status
 */
export function importProgress(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    saveLocalData(data);
    return true;
  } catch (error) {
    console.error('Error importing progress:', error);
    return false;
  }
}
