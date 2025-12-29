import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';

export async function GET() {
  try {
    // Get counts grouped by CEFR level
    const counts = await prisma.flashcard.groupBy({
      by: ['cefrLevel'],
      _count: {
        id: true,
      },
    });

    // Convert to a more friendly format
    const countMap = {};
    counts.forEach(({ cefrLevel, _count }) => {
      countMap[cefrLevel] = _count.id;
    });

    return NextResponse.json({
      success: true,
      counts: countMap,
      total: counts.reduce((sum, { _count }) => sum + _count.id, 0),
    });
  } catch (error) {
    console.error('Error fetching card counts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch card counts'
      },
      { status: 500 }
    );
  }
}
