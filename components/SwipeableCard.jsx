'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { FlashCard } from './FlashCard';


export function SwipeableCard({
  flashcard,
  onSwipeLeft,
  onSwipeRight,
  style,
}) {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Calculate rotation based on drag
  const rotate = useTransform(x, [-200, 200], [-25, 25]);

  // Calculate opacity for swipe indicators
  const opacityLeft = useTransform(x, [-200, 0], [1, 0]);
  const opacityRight = useTransform(x, [0, 200], [0, 1]);

  function handleDragEnd(_event, info) {
    const threshold = 150;

    if (info.offset.x > threshold) {
      // Swipe right - Know it
      onSwipeRight(flashcard);
    } else if (info.offset.x < -threshold) {
      // Swipe left - Don't know
      onSwipeLeft(flashcard);
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className="absolute w-full h-full"
      style={{
        x,
        y,
        rotate,
        ...style,
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      <div className="relative w-full h-full">
        {/* Swipe Left Indicator - Don't Know */}
        <motion.div
          className="absolute top-8 right-8 z-10 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg"
          style={{ opacity: opacityLeft }}
        >
          ❌ Don&apos;t Know
        </motion.div>

        {/* Swipe Right Indicator - Know */}
        <motion.div
          className="absolute top-8 left-8 z-10 bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg"
          style={{ opacity: opacityRight }}
        >
          ✓ Know It!
        </motion.div>

        {/* Flash Card */}
        <FlashCard flashcard={flashcard} />
      </div>
    </motion.div>
  );
}
