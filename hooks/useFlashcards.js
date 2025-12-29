import { useState, useEffect } from 'react';

export function useFlashcards(levels = []) {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFlashcards() {
      try {
        setLoading(true);
        setError(null);

        const levelsQuery = levels.length > 0 ? `?levels=${levels.join(',')}` : '';
        const response = await fetch(`/api/flashcards${levelsQuery}`);

        if (!response.ok) {
          throw new Error('Failed to fetch flashcards');
        }

        const result = await response.json();

        if (result.success) {
          setFlashcards(result.data);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load flashcards');
        console.error('Error fetching flashcards:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFlashcards();
  }, [levels.join(',')]);

  return { flashcards, loading, error };
}
