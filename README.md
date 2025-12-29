# FlashCards PWA - English-Indonesian Vocabulary Learning App

A modern, mobile-first Progressive Web App (PWA) for learning English vocabulary with Indonesian translations. Features CEFR-leveled content, spaced repetition learning, and interactive swipe gestures.

## Features

- 📱 **PWA Support** - Install on mobile devices like a native app
- 🎯 **CEFR Levels** - Content organized by A1-C2 proficiency levels
- 🧠 **Spaced Repetition** - SM-2 algorithm for optimal learning
- 👆 **Swipe Gestures** - Tinder-like interface for quick reviews
- 💾 **Offline Progress** - All progress saved locally in browser
- 🎨 **Beautiful UI** - Smooth animations with Framer Motion
- 📊 **Progress Tracking** - Detailed statistics and learning insights
- 🗣️ **Conversation Context** - Real-world usage examples for speaking

## Tech Stack

- **Frontend/Backend**: Next.js 15 (App Router, TypeScript)
- **Database**: PostgreSQL via Supabase
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State**: React Hooks + localStorage

## Setup Instructions

### 1. Database Setup (Supabase)

#### Create Supabase Project
1. Go to [Supabase](https://supabase.com) and create a new project
2. Note your project URL and anon key

#### Create Flashcards Table

Run this SQL in the Supabase SQL Editor:

\`\`\`sql
-- Create CEFR level enum
CREATE TYPE cefr_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- Create flashcards table
CREATE TABLE flashcards (
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

-- Create indexes for performance
CREATE INDEX idx_flashcards_level ON flashcards(cefr_level);
CREATE INDEX idx_flashcards_frequency ON flashcards(frequency_rank);

-- Enable Row Level Security (RLS)
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON flashcards
  FOR SELECT USING (true);

-- Create policy for authenticated insert (for seeding)
CREATE POLICY "Allow authenticated insert" ON flashcards
  FOR INSERT WITH CHECK (true);
\`\`\`

### 2. Environment Variables

Get your Supabase credentials:
1. Go to Project Settings > API in Supabase
2. Copy the "Project URL" and "anon public" key

Update [.env.local](.env.local):

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_DB_PASSWORD=Tj?5/W.C/VTEugG
\`\`\`

### 3. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 4. Seed the Database

In development mode, seed the database with initial flashcards:

\`\`\`bash
# Start the dev server
npm run dev

# In another terminal or browser, call the seed endpoint
curl -X POST http://localhost:3000/api/seed
\`\`\`

Or visit \`http://localhost:3000/api/seed\` in your browser (must be in development mode).

### 5. Run the App

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
flashcards/
├── app/
│   ├── layout.tsx              # Root layout with PWA meta
│   ├── page.tsx                # Home - Level selection
│   ├── learn/
│   │   └── page.tsx            # Learning interface
│   ├── stats/
│   │   └── page.tsx            # Progress statistics
│   ├── api/
│   │   ├── flashcards/
│   │   │   └── route.ts        # GET flashcards
│   │   └── seed/
│   │       └── route.ts        # Seed database
│   └── globals.css             # Global styles
├── components/
│   ├── FlashCard.tsx           # Flip animation card
│   ├── SwipeableCard.tsx       # Swipe gestures
│   ├── LevelSelector.tsx       # CEFR level picker
│   └── ProgressRing.tsx        # Progress indicator
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── spacedRepetition.ts     # SM-2 algorithm
│   ├── localStorage.ts         # Progress storage
│   └── types.ts                # TypeScript types
├── hooks/
│   ├── useFlashcards.ts        # Flashcard fetching
│   └── useProgress.ts          # Progress tracking
├── data/
│   └── seed-flashcards.ts      # Initial flashcard data
└── public/
    ├── manifest.json           # PWA manifest
    └── icons/                  # PWA icons
\`\`\`

## Adding PWA Icons

Create app icons (192x192 and 512x512 PNG images) and save them as:
- \`public/icon-192.png\`
- \`public/icon-512.png\`

You can use tools like [RealFaviconGenerator](https://realfavicongenerator.net/) or [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator).

## Expanding Flashcards

The seed file in \`data/seed-flashcards.ts\` currently has ~100 example cards. To reach 1000:

1. Follow the existing pattern in the seed file
2. Add more \`createCard()\` calls for each CEFR level
3. Maintain the distribution:
   - A1: 200 words
   - A2: 250 words
   - B1: 250 words
   - B2: 150 words
   - C1: 100 words
   - C2: 50 words

Or use a word frequency list and translation API to generate cards programmatically.

## Development

\`\`\`bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
\`\`\`

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms

The app works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted

## PWA Installation

### iOS
1. Open app in Safari
2. Tap Share button
3. Select "Add to Home Screen"

### Android
1. Open app in Chrome
2. Tap menu (⋮)
3. Select "Add to Home Screen"

## Local Storage

All user progress is stored locally in the browser using localStorage:
- No account required
- Works offline
- Privacy-first approach

To reset progress:
1. Go to browser DevTools
2. Application > Local Storage
3. Delete the \`flashcards-progress\` key

## Spaced Repetition Algorithm

Uses the SM-2 algorithm (SuperMemo 2):
- New cards appear immediately
- Known cards: interval increases (1→6→14→30 days)
- Unknown cards: reset to daily review
- Easiness factor adjusts based on performance

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

## Acknowledgments

- Spaced repetition based on SuperMemo 2 algorithm
- CEFR framework for language proficiency levels
- English-Indonesian translations
