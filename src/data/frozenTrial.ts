export type TrialQuestion = {
  q: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
};

export type TrialLevel = {
  id: number; // 1..10
  title: string;
  subtitle: string;
  questions: TrialQuestion[];
};

export const FROZEN_TRIAL_LEVELS: TrialLevel[] = [
  {
    id: 1,
    title: 'LEVEL 1',
    subtitle: 'VERY EASY (Warm-up)',
    questions: [
      {
        q: 'What color is ice most often associated with?',
        options: ['Blue', 'Green', 'Red'],
        correctIndex: 0,
      },
      {
        q: 'How many legs does a fish have?',
        options: ['Two', 'Four', 'None'],
        correctIndex: 2,
      },
      {
        q: 'Which direction does the sun rise from?',
        options: ['North', 'East', 'West'],
        correctIndex: 1,
      },
      {
        q: 'Which of these is coldest?',
        options: ['Fire', 'Ice', 'Sand'],
        correctIndex: 1,
      },
      {
        q: 'What do fish use to breathe?',
        options: ['Lungs', 'Gills', 'Fins'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 2,
    title: 'LEVEL 2',
    subtitle: 'EASY',
    questions: [
      { q: 'Which animal lives underwater?', options: ['Bird', 'Fish', 'Cat'], correctIndex: 1 },
      { q: 'What freezes to become ice?', options: ['Water', 'Air', 'Stone'], correctIndex: 0 },
      { q: 'Which is heavier?', options: ['Ice', 'Water (same amount)', 'Air'], correctIndex: 1 },
      { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter'], correctIndex: 1 },
      { q: 'What covers most of the Earth?', options: ['Land', 'Water', 'Ice'], correctIndex: 1 },
    ],
  },
  {
    id: 3,
    title: 'LEVEL 3',
    subtitle: 'EASY+',
    questions: [
      { q: 'At what temperature does water freeze (°C)?', options: ['0', '10', '−10'], correctIndex: 0 },
      { q: 'Which ocean is the largest?', options: ['Atlantic', 'Indian', 'Pacific'], correctIndex: 2 },
      { q: 'What happens to water when it freezes?', options: ['It shrinks', 'It disappears', 'It expands'], correctIndex: 2 },
      { q: 'Which animal is known for swimming in schools?', options: ['Fish', 'Bear', 'Eagle'], correctIndex: 0 },
      { q: 'Which is a natural source of light?', options: ['Lamp', 'Sun', 'Screen'], correctIndex: 1 },
    ],
  },
  {
    id: 4,
    title: 'LEVEL 4',
    subtitle: 'MEDIUM',
    questions: [
      { q: 'Why does ice float on water?', options: ['It is lighter due to expansion', 'It is warmer', 'It traps air'], correctIndex: 0 },
      { q: 'Which layer of water is coldest in a frozen lake?', options: ['Surface', 'Bottom', 'Middle'], correctIndex: 0 },
      { q: 'What gas do fish absorb from water?', options: ['Carbon dioxide', 'Oxygen', 'Nitrogen'], correctIndex: 1 },
      { q: 'Which season has the shortest days?', options: ['Summer', 'Winter', 'Spring'], correctIndex: 1 },
      { q: 'What does pressure do underwater as depth increases?', options: ['Decreases', 'Stays the same', 'Increases'], correctIndex: 2 },
    ],
  },
  {
    id: 5,
    title: 'LEVEL 5',
    subtitle: 'MEDIUM+',
    questions: [
      { q: 'Which substance is most transparent in water?', options: ['Ice', 'Salt', 'Glass'], correctIndex: 2 },
      { q: 'Why is deep water darker?', options: ['Less light reaches it', 'Water changes color', 'Fish block light'], correctIndex: 0 },
      { q: 'What slows movement underwater?', options: ['Gravity', 'Air', 'Resistance'], correctIndex: 2 },
      { q: 'Which freezes faster?', options: ['Hot water', 'Cold water', 'Salt water'], correctIndex: 1 },
      { q: 'What helps fish stay balanced?', options: ['Tail', 'Lateral line', 'Scales'], correctIndex: 1 },
    ],
  },
  {
    id: 6,
    title: 'LEVEL 6',
    subtitle: 'MEDIUM / HARD',
    questions: [
      { q: 'What happens if ice melts?', options: ['Water level decreases', 'Water level increases', 'Water level stays the same (floating ice)'], correctIndex: 2 },
      { q: 'Which light color penetrates water the deepest?', options: ['Red', 'Blue', 'Yellow'], correctIndex: 1 },
      { q: 'What does “buoyancy” describe?', options: ['Speed', 'Floating ability', 'Temperature'], correctIndex: 1 },
      { q: 'Why are fish streamlined?', options: ['To look bigger', 'To move efficiently', 'To store heat'], correctIndex: 1 },
      { q: 'Which is colder?', options: ['−5°C water', '−5°C ice', 'Same'], correctIndex: 1 },
    ],
  },
  {
    id: 7,
    title: 'LEVEL 7',
    subtitle: 'HARD',
    questions: [
      { q: 'What forms when water freezes slowly?', options: ['Smooth ice', 'Crystalline structures', 'Steam'], correctIndex: 1 },
      { q: 'Which factor affects freezing point?', options: ['Salt content', 'Color', 'Shape'], correctIndex: 0 },
      { q: 'Why don’t lakes freeze solid?', options: ['Heat from Earth', 'Ice floats and insulates', 'Fish movement'], correctIndex: 1 },
      { q: 'What is the main danger of deep cold water?', options: ['Darkness', 'Pressure and heat loss', 'Noise'], correctIndex: 1 },
      { q: 'Which fish can survive near freezing temperatures?', options: ['Tropical fish', 'Icefish', 'Freshwater carp'], correctIndex: 1 },
    ],
  },
  {
    id: 8,
    title: 'LEVEL 8',
    subtitle: 'VERY HARD',
    questions: [
      { q: 'What happens to sound underwater?', options: ['Travels slower', 'Travels faster', 'Stops'], correctIndex: 1 },
      { q: 'Which freezes first: fresh or salt water?', options: ['Salt water', 'Fresh water', 'Same'], correctIndex: 1 },
      { q: 'Why is ice sometimes blue?', options: ['Reflection', 'Light absorption of red wavelengths', 'Algae'], correctIndex: 1 },
      { q: 'What limits visibility underwater?', options: ['Fog', 'Particles and light loss', 'Temperature'], correctIndex: 1 },
      { q: 'Which factor most affects underwater movement?', options: ['Weight', 'Shape', 'Color'], correctIndex: 1 },
    ],
  },
  {
    id: 9,
    title: 'LEVEL 9',
    subtitle: 'EXPERT',
    questions: [
      { q: 'What is supercooling?', options: ['Water below freezing without ice', 'Extra cold ice', 'Frozen air'], correctIndex: 0 },
      { q: 'Why do bubbles rise underwater?', options: ['Heat', 'Buoyancy', 'Pressure'], correctIndex: 1 },
      { q: 'Which freezes slower?', options: ['Thin ice', 'Thick ice', 'Snow'], correctIndex: 1 },
      { q: 'What protects fish from cold?', options: ['Fat and antifreeze proteins', 'Scales only', 'Speed'], correctIndex: 0 },
      { q: 'Why does ice crack?', options: ['Expansion and stress', 'Fish movement', 'Air bubbles'], correctIndex: 0 },
    ],
  },
  {
    id: 10,
    title: 'LEVEL 10',
    subtitle: 'FINAL / TRIAL',
    questions: [
      { q: 'What happens to pressure when diving deeper?', options: ['Decreases', 'Increases exponentially', 'Stays linear'], correctIndex: 1 },
      { q: 'Why does light fade underwater?', options: ['Reflection', 'Absorption and scattering', 'Temperature'], correctIndex: 1 },
      { q: 'Which freezes last in nature?', options: ['Rivers', 'Lakes', 'Oceans'], correctIndex: 2 },
      { q: 'Why is silence stronger underwater?', options: ['Sound travels differently', 'No air', 'Fish absorb sound'], correctIndex: 0 },
      { q: 'What best describes deep cold water?', options: ['Empty', 'Still and dense', 'Fast'], correctIndex: 1 },
    ],
  },
];
