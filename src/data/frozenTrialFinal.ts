export type FinalTrialQuestion = {
  text: string;
  answers: [string, string, string];
  correct: 0 | 1 | 2;
};

export const FROZEN_TRIAL_FINAL_10: FinalTrialQuestion[] = [
  {
    text: 'Why does ice insulate water beneath it?',
    answers: ['Ice generates heat', 'Ice blocks wind', 'Ice floats and slows heat loss'],
    correct: 2,
  },
  {
    text: 'Which light wavelength travels deepest underwater?',
    answers: ['Red', 'Blue', 'Green'],
    correct: 1,
  },
  {
    text: 'What happens to pressure as you go deeper underwater?',
    answers: ['It decreases', 'It stays constant', 'It increases steadily'],
    correct: 2,
  },
  {
    text: 'Why don’t frozen lakes usually freeze solid to the bottom?',
    answers: ['Fish produce heat', 'Ice floats and traps warmer water below', 'Water stops freezing after a point'],
    correct: 1,
  },
  {
    text: 'Which freezes first in nature?',
    answers: ['Freshwater lake', 'Saltwater ocean', 'River flowing water'],
    correct: 0,
  },
  {
    text: 'What causes ice to crack loudly in cold conditions?',
    answers: ['Fish movement', 'Sudden temperature change causing expansion and stress', 'Air trapped under ice'],
    correct: 1,
  },
  {
    text: 'Why do objects move slower underwater than in air?',
    answers: ['Gravity is stronger', 'Water resistance is higher', 'Lack of oxygen'],
    correct: 1,
  },
  {
    text: 'What allows some fish to survive near-freezing water?',
    answers: ['Thick scales', 'Constant movement', 'Antifreeze proteins in their blood'],
    correct: 2,
  },
  {
    text: 'Why does sound travel farther underwater than in air?',
    answers: ['Water absorbs sound', 'Water transmits vibrations more efficiently', 'There is no wind'],
    correct: 1,
  },
  {
    text: 'What best describes deep cold water beneath ice?',
    answers: ['Empty and lifeless', 'Chaotic and fast', 'Dense, quiet, and stable'],
    correct: 2,
  },
];
