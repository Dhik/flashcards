// Constants and configuration for FlashCards app

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const LEVEL_INFO = {
  A1: {
    name: 'Beginner',
    description: 'Basic everyday words and phrases',
    color: 'bg-green-500',
  },
  A2: {
    name: 'Elementary',
    description: 'Common expressions and routine tasks',
    color: 'bg-lime-500',
  },
  B1: {
    name: 'Intermediate',
    description: 'Familiar matters and personal interests',
    color: 'bg-yellow-500',
  },
  B2: {
    name: 'Upper Intermediate',
    description: 'Complex texts and abstract topics',
    color: 'bg-orange-500',
  },
  C1: {
    name: 'Advanced',
    description: 'Fluent, flexible language use',
    color: 'bg-red-500',
  },
  C2: {
    name: 'Mastery',
    description: 'Precision and sophistication',
    color: 'bg-purple-500',
  },
};

export const CARD_STATUS = {
  NEW: 'new',
  LEARNING: 'learning',
  KNOWN: 'known',
};
