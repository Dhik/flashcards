-- FlashCards Database Setup Script for Supabase
-- Run this in your Supabase SQL Editor

-- 1. Create CEFR level enum type
CREATE TYPE cefr_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- 2. Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  english_word TEXT NOT NULL,
  indonesian_translation TEXT NOT NULL,
  cefr_level cefr_level NOT NULL,
  part_of_speech TEXT,
  example_sentence_en TEXT,
  example_sentence_id TEXT,
  conversation_context TEXT,
  pronunciation_guide TEXT,
  frequency_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_flashcards_level ON flashcards(cefr_level);
CREATE INDEX IF NOT EXISTS idx_flashcards_frequency ON flashcards(frequency_rank);
CREATE INDEX IF NOT EXISTS idx_flashcards_created ON flashcards(created_at);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON flashcards;
DROP POLICY IF EXISTS "Allow authenticated insert" ON flashcards;
DROP POLICY IF EXISTS "Allow service role all" ON flashcards;

-- 6. Create RLS policies

-- Allow anyone to read flashcards (public access)
CREATE POLICY "Allow public read access"
  ON flashcards
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert (for seeding via API)
CREATE POLICY "Allow authenticated insert"
  ON flashcards
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to delete (for re-seeding)
CREATE POLICY "Allow authenticated delete"
  ON flashcards
  FOR DELETE
  USING (true);

-- 7. Grant permissions
GRANT SELECT ON flashcards TO anon;
GRANT ALL ON flashcards TO authenticated;
GRANT ALL ON flashcards TO service_role;

-- 8. Verify the setup
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'flashcards';

-- 9. Check current flashcard count
SELECT
  cefr_level,
  COUNT(*) as count
FROM flashcards
GROUP BY cefr_level
ORDER BY cefr_level;

-- Optional: Sample query to test
-- SELECT * FROM flashcards WHERE cefr_level = 'A1' LIMIT 10;
