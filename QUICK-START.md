# 🚀 Quick Start Guide

Follow these steps in order to get your FlashCards app running:

## ✅ Step 1: Add Supabase Anon Key

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the **anon public** key
5. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-copied-anon-key
```

## ✅ Step 2: Push Database Schema

This creates the `flashcards` table in your Supabase database:

```bash
npx prisma db push
```

You should see: `✔ Your database is now in sync with your schema`

## ✅ Step 3: Install Dependencies (if not done)

```bash
npm install
```

## ✅ Step 4: Start Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## ✅ Step 5: Seed the Database

Open your browser and visit:

```
http://localhost:3000/api/seed
```

This will populate your database with the initial flashcards.

You should see a success message with the count of seeded flashcards.

## ✅ Step 6: Start Learning!

1. Go to http://localhost:3000
2. Select CEFR levels (e.g., A1, A2)
3. Click "Start Learning"
4. Swipe cards:
   - **Swipe Right** = I know this word
   - **Swipe Left** = I don't know this word
5. Check your progress in the Stats page

## 🎯 Adding More Flashcards

The starter set in `data/seed-flashcards.js` has ~20 example flashcards.

To add more, follow this pattern:

```javascript
{
  englishWord: 'example',
  indonesianTranslation: 'contoh',
  cefrLevel: 'A1', // A1, A2, B1, B2, C1, or C2
  partOfSpeech: 'noun',
  exampleSentenceEn: 'This is an example.',
  exampleSentenceId: 'Ini adalah contoh.',
  conversationContext: 'Explaining something',
  frequencyRank: 11,
}
```

Then re-seed the database by visiting `/api/seed` again.

## 🔧 Useful Prisma Commands

```bash
# View database in browser
npx prisma studio

# Reset database (deletes all data)
npx prisma db push --force-reset

# Create migration
npx prisma migrate dev --name your-migration-name

# Regenerate Prisma Client
npx prisma generate
```

## 📱 Install as PWA

### On Mobile (Android)
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home Screen"

### On Mobile (iOS)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

## ❗ Troubleshooting

### "Failed to fetch flashcards"
- Check that your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- Verify the `DATABASE_URL` is correct
- Make sure you ran `npx prisma db push`

### "No flashcards found"
- Visit `/api/seed` to populate the database
- Check that seeding was successful

### Database connection errors
- Verify your Supabase project is active
- Check that the DATABASE_URL in `.env.local` is correct
- Ensure your IP is allowed in Supabase (usually not an issue with connection pooler)

## 🎉 You're All Set!

Your flashcard app is ready to help you master English vocabulary!

Happy learning! 📚
