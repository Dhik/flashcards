'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';


export function FlashCard({ flashcard, onFlip }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  return (
    <div className="w-full h-full perspective-1000" onClick={handleFlip}>
      <motion.div
        className="relative w-full h-full cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        {/* Front of card - English */}
        <div
          className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-8 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex justify-between items-start">
            <span className="text-white/80 text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              {flashcard.cefrLevel}
            </span>
            {flashcard.partOfSpeech && (
              <span className="text-white/70 text-xs italic">
                {flashcard.partOfSpeech}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold text-white text-center">
              {flashcard.englishWord}
            </h2>

            {flashcard.exampleSentenceEn && (
              <div className="max-w-lg">
                <p className="text-white/90 text-lg leading-relaxed text-center italic">
                  "{flashcard.exampleSentenceEn}"
                </p>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-white/60 text-sm">Tap to see translation</p>
          </div>
        </div>

        {/* Back of card - Indonesian */}
        <div
          className="absolute w-full h-full backface-hidden bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl shadow-2xl p-8 flex flex-col justify-between"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex justify-between items-start">
            <span className="text-white/80 text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
              Indonesian
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-4 px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center">
              {flashcard.indonesianTranslation}
            </h2>

            {flashcard.pronunciationGuide && (
              <p className="text-white/70 text-lg italic">
                /{flashcard.pronunciationGuide}/
              </p>
            )}

            {flashcard.exampleSentenceEn && (
              <div className="space-y-3 mt-6 max-w-lg">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-white/90 text-base leading-relaxed text-center">
                    "{flashcard.exampleSentenceEn}"
                  </p>
                </div>
                {flashcard.exampleSentenceId && (
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-white/90 text-base leading-relaxed text-center">
                      "{flashcard.exampleSentenceId}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {flashcard.conversationContext && (
              <div className="mt-2 bg-white/15 rounded-lg p-3 max-w-lg">
                <p className="text-white/80 text-sm text-center">
                  💬 {flashcard.conversationContext}
                </p>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-white/60 text-sm">Tap to flip back</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
