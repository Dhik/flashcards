/**
 * SM-2 Spaced Repetition Algorithm
 * Based on SuperMemo 2 algorithm for optimal learning intervals
 */

const INITIAL_EASINESS = 2.5;
const MINIMUM_EASINESS = 1.3;
const INITIAL_INTERVAL = 1; // 1 day for first review

export function getInitialProgress() {
  return {
    easiness: INITIAL_EASINESS,
    interval: 0,
    repetitions: 0,
    nextReview: Date.now(),
    lastReviewed: 0,
    status: 'new',
  };
}

/**
 * Calculate next review schedule based on user response
 * @param {Object} currentProgress - Current card progress
 * @param {boolean} knew - Whether user knew the answer (true = right swipe, false = left swipe)
 * @returns {Object} Updated card progress
 */
export function calculateNextReview(currentProgress, knew) {
  const now = Date.now();
  let { easiness, interval, repetitions } = currentProgress;

  if (knew) {
    // User knew the answer - increase interval
    repetitions += 1;

    if (repetitions === 1) {
      interval = INITIAL_INTERVAL;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easiness);
    }

    // Update easiness factor (make it slightly easier next time)
    easiness = Math.max(MINIMUM_EASINESS, easiness + 0.1);

    const nextReview = now + interval * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    return {
      easiness,
      interval,
      repetitions,
      nextReview,
      lastReviewed: now,
      status: repetitions >= 3 ? 'known' : 'learning',
    };
  } else {
    // User didn't know - reset to beginning
    repetitions = 0;
    interval = 0;

    // Decrease easiness (make it harder/more frequent)
    easiness = Math.max(MINIMUM_EASINESS, easiness - 0.2);

    const nextReview = now; // Show again soon

    return {
      easiness,
      interval,
      repetitions,
      nextReview,
      lastReviewed: now,
      status: 'learning',
    };
  }
}

/**
 * Check if a card is due for review
 * @param {Object} progress - Card progress
 * @returns {boolean} true if card should be reviewed now
 */
export function isDue(progress) {
  return Date.now() >= progress.nextReview;
}

/**
 * Get priority score for card (higher = more urgent)
 * Used for sorting cards to show most important first
 * @param {Object} progress - Card progress
 * @returns {number} Priority score
 */
export function getPriority(progress) {
  const now = Date.now();
  const overdueDays = (now - progress.nextReview) / (24 * 60 * 60 * 1000);

  // New cards get medium priority
  if (progress.status === 'new') {
    return 1000;
  }

  // Overdue cards get high priority (more overdue = higher priority)
  if (overdueDays > 0) {
    return 2000 + overdueDays * 100;
  }

  // Not due yet - low priority
  return 0;
}

/**
 * Calculate percentage of cards known
 * @param {number} total - Total cards
 * @param {number} known - Known cards
 * @returns {number} Percentage
 */
export function calculateKnownPercentage(total, known) {
  if (total === 0) return 0;
  return Math.round((known / total) * 100);
}

/**
 * Get study streak in days
 * @param {string} lastStudyDate - Last study date
 * @returns {number} Streak in days
 */
export function getStudyStreak(lastStudyDate) {
  if (!lastStudyDate) return 0;

  const last = new Date(lastStudyDate);
  const today = new Date();

  // Reset time to midnight for accurate day comparison
  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Streak continues if studied today or yesterday
  if (diffDays <= 1) {
    return 1; // Simplified - in real app, track consecutive days
  }

  return 0; // Streak broken
}
