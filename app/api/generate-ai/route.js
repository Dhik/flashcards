import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '../../../lib/prisma.js';

const LEVEL_DESCRIPTIONS = {
  A1: 'Basic beginner level - everyday expressions, basic phrases, greetings, family, food, numbers, colors',
  A2: 'Elementary level - simple everyday topics, shopping, work, weather, hobbies',
  B1: 'Intermediate level - familiar matters, work, school, leisure, opinions, experiences',
  B2: 'Upper-intermediate level - abstract topics, technical discussions, complex texts',
  C1: 'Advanced level - complex texts, implicit meaning, sophisticated expression',
  C2: 'Mastery level - subtle expressions, idioms, literary vocabulary'
};

export async function POST(request) {
  try {
    const { level, count = 50 } = await request.json();

    if (!level || !LEVEL_DESCRIPTIONS[level]) {
      return NextResponse.json(
        { success: false, error: 'Invalid CEFR level' },
        { status: 400 }
      );
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log(`🤖 Generating ${count} ${level} level flashcards using AI...`);

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

    // Get current max rank
    const maxRank = await prisma.flashcard.findFirst({
      orderBy: { frequencyRank: 'desc' },
      select: { frequencyRank: true }
    });

    let startRank = (maxRank?.frequencyRank || 0) + 1;

    // Add metadata to each flashcard and map fields to match schema
    const flashcardsWithMeta = flashcards.map((card, index) => ({
      englishWord: card.englishWord,
      indonesianTranslation: card.indonesianTranslation,
      partOfSpeech: card.partOfSpeech,
      exampleSentenceEn: card.exampleSentenceEn,
      exampleSentenceId: card.exampleSentenceId,
      // Handle both possible field names from AI
      conversationContext: card.conversationContext || card.conversationSentence || null,
      cefrLevel: level,
      frequencyRank: startRank + index,
    }));

    // Insert into database
    const result = await prisma.flashcard.createMany({
      data: flashcardsWithMeta,
      skipDuplicates: true,
    });

    console.log(`💾 Saved ${result.count} flashcards to database`);

    return NextResponse.json({
      success: true,
      generated: flashcards.length,
      saved: result.count,
      level: level,
    });

  } catch (error) {
    console.error('❌ Error generating flashcards:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate flashcards'
      },
      { status: 500 }
    );
  }
}
