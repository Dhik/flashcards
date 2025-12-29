// AI-Powered Flashcard Generator using OpenAI
// Usage: node scripts/generate-ai-flashcards.js <level> <count>
// Example: node scripts/generate-ai-flashcards.js A1 50

import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
  console.log('Please set OPENAI_API_KEY in your .env.local file');
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in environment variables');
  console.log('Please set DATABASE_URL in your .env.local file');
  process.exit(1);
}

// Initialize OpenAI
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Initialize Prisma with adapter
const pool = new pg.Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const LEVEL_DESCRIPTIONS = {
  A1: 'Basic beginner level - everyday expressions, basic phrases, greetings, family, food, numbers, colors',
  A2: 'Elementary level - simple everyday topics, shopping, work, weather, hobbies',
  B1: 'Intermediate level - familiar matters, work, school, leisure, opinions, experiences',
  B2: 'Upper-intermediate level - abstract topics, technical discussions, complex texts',
  C1: 'Advanced level - complex texts, implicit meaning, sophisticated expression',
  C2: 'Mastery level - subtle expressions, idioms, literary vocabulary'
};

async function generateFlashcards(level, count) {
  console.log(`\n🤖 Generating ${count} ${level} level flashcards using AI...`);

  const prompt = `Generate exactly ${count} English-Indonesian vocabulary flashcards for CEFR level ${level}.

Level description: ${LEVEL_DESCRIPTIONS[level]}

For each flashcard, provide:
1. English word or phrase
2. Indonesian translation
3. Part of speech (noun, verb, adjective, adverb, phrase, etc.)
4. Example sentence in English
5. Example sentence in Indonesian
6. Conversation context (when/how to use it)

Format as a JSON array with this structure:
[
  {
    "englishWord": "hello",
    "indonesianTranslation": "halo",
    "partOfSpeech": "interjection",
    "exampleSentenceEn": "Hello, how are you?",
    "exampleSentenceId": "Halo, apa kabar?",
    "conversationContext": "Greeting someone"
  }
]

Focus on practical, commonly-used vocabulary for ${level} level learners.
Ensure variety across different topics: food, family, work, emotions, activities, objects, etc.
Make sure Indonesian translations are accurate and natural.

Return ONLY the JSON array, no other text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Indonesian language teacher creating vocabulary flashcards. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content.trim();

    // Extract JSON from response (handle markdown code blocks)
    let jsonString = content;
    if (content.startsWith('```')) {
      jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const flashcards = JSON.parse(jsonString);

    console.log(`✅ Generated ${flashcards.length} flashcards`);
    return flashcards;

  } catch (error) {
    console.error('❌ Error generating flashcards:', error.message);
    throw error;
  }
}

async function saveFlashcards(flashcards, level) {
  console.log(`💾 Saving ${flashcards.length} flashcards to database...`);

  try {
    // Get current max rank
    const maxRank = await prisma.flashcard.findFirst({
      orderBy: { frequencyRank: 'desc' },
      select: { frequencyRank: true }
    });

    let startRank = (maxRank?.frequencyRank || 0) + 1;

    // Add metadata to each flashcard
    const flashcardsWithMeta = flashcards.map((card, index) => ({
      ...card,
      cefrLevel: level,
      frequencyRank: startRank + index,
    }));

    // Insert into database
    const result = await prisma.flashcard.createMany({
      data: flashcardsWithMeta,
      skipDuplicates: true,
    });

    console.log(`✅ Saved ${result.count} flashcards to database`);
    return result.count;

  } catch (error) {
    console.error('❌ Error saving flashcards:', error.message);
    throw error;
  }
}

async function generateForAllLevels() {
  console.log('🚀 Starting AI-powered flashcard generation for 1000 cards...\n');

  const distribution = {
    A1: 200,
    A2: 250,
    B1: 250,
    B2: 150,
    C1: 100,
    C2: 50,
  };

  let totalGenerated = 0;
  let totalSaved = 0;

  for (const [level, count] of Object.entries(distribution)) {
    try {
      // Generate in batches of 50 to avoid token limits
      const batchSize = 50;
      const batches = Math.ceil(count / batchSize);

      for (let i = 0; i < batches; i++) {
        const batchCount = Math.min(batchSize, count - (i * batchSize));
        console.log(`\n📚 Processing ${level} - Batch ${i + 1}/${batches} (${batchCount} cards)`);

        const flashcards = await generateFlashcards(level, batchCount);
        const saved = await saveFlashcards(flashcards, level);

        totalGenerated += flashcards.length;
        totalSaved += saved;

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`\n❌ Error processing ${level}:`, error.message);
      console.log('Continuing with next level...\n');
    }
  }

  console.log(`\n\n🎉 Generation complete!`);
  console.log(`📊 Total generated: ${totalGenerated} flashcards`);
  console.log(`💾 Total saved: ${totalSaved} flashcards`);

  await prisma.$disconnect();
  await pool.end();
}

// Run the generator
if (process.argv[2] === 'all') {
  generateForAllLevels().catch(console.error);
} else {
  const level = process.argv[2] || 'A1';
  const count = parseInt(process.argv[3]) || 50;

  console.log(`🚀 Generating ${count} flashcards for level ${level}...\n`);

  generateFlashcards(level, count)
    .then(flashcards => saveFlashcards(flashcards, level))
    .then(savedCount => {
      console.log(`\n🎉 Successfully generated and saved ${savedCount} flashcards!`);
      return prisma.$disconnect();
    })
    .then(() => pool.end())
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}
