# Quick Setup Guide

Follow these steps to get your FlashCards app running:

## Step 1: Configure Environment Variables

1. Open `.env.local` file
2. Update with your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the "Project URL" and "anon public key"
   - Paste them into `.env.local`

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

## Step 2: Set Up Database

1. Go to your Supabase project
2. Click on "SQL Editor" in the left sidebar
3. Open \`database-setup.sql\` from this project
4. Copy all the SQL code
5. Paste it into the Supabase SQL Editor
6. Click "Run" to execute

This will create:
- The `flashcards` table
- CEFR level enum type
- Indexes for performance
- Row Level Security policies

## Step 3: Install Dependencies

\`\`\`bash
npm install
\`\`\`

## Step 4: Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The app will be available at [http://localhost:3000](http://localhost:3000)

## Step 5: Seed the Database

With the dev server running, seed your database:

**Option A: Using Browser**
- Visit \`http://localhost:3000/api/seed\` in your browser

**Option B: Using curl**
\`\`\`bash
curl -X POST http://localhost:3000/api/seed
\`\`\`

This will populate the database with the flashcards from \`data/seed-flashcards.ts\`.

## Step 6: Create PWA Icons (Optional)

For the PWA to work properly, you need app icons:

1. Create two PNG images:
   - 192x192 pixels
   - 512x512 pixels

2. Name them:
   - \`icon-192.png\`
   - \`icon-512.png\`

3. Place them in the \`public/\` folder

You can use tools like:
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- Or create simple colored squares with your app name using any image editor

## Step 7: Test the App

1. Open http://localhost:3000
2. Select CEFR levels (e.g., A1, A2)
3. Click "Start Learning"
4. Swipe cards:
   - **Right**: You know the word
   - **Left**: You don't know the word
5. Check your progress in the Stats page

## Troubleshooting

### "No flashcards found"
- Make sure you ran the seed endpoint (Step 5)
- Check your Supabase connection in `.env.local`
- Verify the database table exists in Supabase

### "Failed to fetch flashcards"
- Check your Supabase URL and anon key
- Verify RLS policies are set correctly
- Check browser console for detailed errors

### PWA not installing
- Icons must be present in \`public/\` folder
- Must use HTTPS in production (Vercel provides this automatically)
- Check manifest.json is accessible at \`/manifest.json\`

## Next Steps

- **Expand Flashcards**: Add more words to \`data/seed-flashcards.ts\`
- **Deploy**: Push to Vercel for production deployment
- **Customize**: Modify colors in \`tailwind.config.ts\`
- **Add Features**: Audio pronunciation, dark mode, etc.

## Production Deployment

### Using Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
6. Click "Deploy"

Your app will be live with HTTPS and ready to install as a PWA!

## Support

If you encounter issues:
1. Check the main [README.md](README.md) for detailed documentation
2. Review error messages in browser console
3. Verify all environment variables are set correctly
4. Ensure database setup SQL ran successfully
