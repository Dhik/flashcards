import { NextResponse } from 'next/server';
import { deleteAllFlashcards, createManyFlashcards } from '../../../lib/prisma.js';
import { seedFlashcards } from '../../../data/seed-flashcards.js';

export async function POST() {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        {
          success: false,
          error: 'Seeding is only allowed in development mode',
        },
        { status: 403 }
      );
    }

    // Delete existing flashcards first (for re-seeding)
    console.log('Deleting existing flashcards...');
    await deleteAllFlashcards();

    // Insert new flashcards
    console.log('Inserting new flashcards...');
    const result = await createManyFlashcards(seedFlashcards);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${result.count} flashcards`,
      count: result.count,
    });
  } catch (error) {
    console.error('Unexpected error during seeding:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
