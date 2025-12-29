// Prisma Client singleton with Prisma 7 adapter

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global;

// Create PostgreSQL pool and adapter for Prisma 7
function createPrismaClient() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database helper functions
export async function getFlashcardsByLevel(levels, limit = 50, random = true) {
  try {
    if (random) {
      // Get random flashcards using raw SQL for better performance
      const flashcards = await prisma.$queryRaw`
        SELECT
          id,
          english_word as "englishWord",
          indonesian_translation as "indonesianTranslation",
          cefr_level as "cefrLevel",
          part_of_speech as "partOfSpeech",
          example_sentence_en as "exampleSentenceEn",
          example_sentence_id as "exampleSentenceId",
          conversation_context as "conversationContext",
          pronunciation_guide as "pronunciationGuide",
          frequency_rank as "frequencyRank",
          created_at as "createdAt"
        FROM "flashcards"
        WHERE "cefr_level"::text = ANY(${levels}::text[])
        ORDER BY RANDOM()
        LIMIT ${limit}
      `;
      return flashcards;
    } else {
      const flashcards = await prisma.flashcard.findMany({
        where: {
          cefrLevel: {
            in: levels,
          },
        },
        orderBy: {
          frequencyRank: 'asc',
        },
        take: limit,
      });

      return flashcards;
    }
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return [];
  }
}

export async function getAllFlashcards() {
  try {
    const flashcards = await prisma.flashcard.findMany({
      orderBy: {
        frequencyRank: 'asc',
      },
    });

    return flashcards;
  } catch (error) {
    console.error('Error fetching all flashcards:', error);
    return [];
  }
}

export async function getFlashcardCount(level) {
  try {
    const where = level ? { cefrLevel: level } : {};

    const count = await prisma.flashcard.count({
      where,
    });

    return count;
  } catch (error) {
    console.error('Error counting flashcards:', error);
    return 0;
  }
}

export async function createFlashcard(data) {
  try {
    const flashcard = await prisma.flashcard.create({
      data,
    });

    return flashcard;
  } catch (error) {
    console.error('Error creating flashcard:', error);
    throw error;
  }
}

export async function createManyFlashcards(flashcards) {
  try {
    const result = await prisma.flashcard.createMany({
      data: flashcards,
      skipDuplicates: true,
    });

    return result;
  } catch (error) {
    console.error('Error creating flashcards:', error);
    throw error;
  }
}

export async function deleteAllFlashcards() {
  try {
    const result = await prisma.flashcard.deleteMany({});
    return result;
  } catch (error) {
    console.error('Error deleting flashcards:', error);
    throw error;
  }
}
