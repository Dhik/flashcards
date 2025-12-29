import { NextResponse } from 'next/server';
import { getFlashcardsByLevel, getAllFlashcards } from '../../../lib/prisma.js';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const levelsParam = searchParams.get('levels');
    const limitParam = searchParams.get('limit');

    const limit = limitParam ? parseInt(limitParam) : 50;

    let flashcards;

    if (levelsParam) {
      const levels = levelsParam.split(',');
      flashcards = await getFlashcardsByLevel(levels, limit);
    } else {
      flashcards = await getAllFlashcards();
    }

    return NextResponse.json({
      success: true,
      data: flashcards,
      count: flashcards.length,
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch flashcards',
      },
      { status: 500 }
    );
  }
}
