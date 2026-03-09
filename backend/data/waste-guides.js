const WASTE_GUIDES = {
  // Fruits
  apple: {
    category: 'Fruits',
    description: 'Whole apple or apple pieces',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#ef4444',
  },
  'apple-core': {
    category: 'Fruits',
    description: 'Apple core after eating',
    compostable: true,
    avgDecompositionDays: '14-21',
    color: '#ef4444',
  },
  'apple-peel': {
    category: 'Fruits',
    description: 'Peeled apple skin',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#ef4444',
  },
  avocado: {
    category: 'Fruits',
    description: 'Avocado flesh or whole fruit',
    compostable: true,
    avgDecompositionDays: '21-30',
    color: '#ef4444',
  },
  'banana-peel': {
    category: 'Fruits',
    description: 'Banana peels and skins',
    compostable: true,
    avgDecompositionDays: '14-21',
    color: '#ef4444',
  },
  'bitten-apple': {
    category: 'Fruits',
    description: 'Partially eaten apple',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#ef4444',
  },
  calamansi: {
    category: 'Fruits',
    description: 'Calamansi citrus fruit',
    compostable: true,
    avgDecompositionDays: '14-21',
    color: '#ef4444',
  },
  mango: {
    category: 'Fruits',
    description: 'Mango flesh, skin, or seed',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#ef4444',
  },
  orange: {
    category: 'Fruits',
    description: 'Whole orange or orange segments',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#ef4444',
  },
  'orange-peel': {
    category: 'Fruits',
    description: 'Orange peels and rinds',
    compostable: true,
    avgDecompositionDays: '30-60',
    color: '#ef4444',
  },
  pear: {
    category: 'Fruits',
    description: 'Whole pear or pear pieces',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#ef4444',
  },
  'pear-core': {
    category: 'Fruits',
    description: 'Pear core after eating',
    compostable: true,
    avgDecompositionDays: '14-21',
    color: '#ef4444',
  },
  'pear-peel': {
    category: 'Fruits',
    description: 'Peeled pear skin',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#ef4444',
  },
  pineapple: {
    category: 'Fruits',
    description: 'Pineapple flesh and core',
    compostable: true,
    avgDecompositionDays: '30-60',
    color: '#ef4444',
  },
  papaya: {
    category: 'Fruits',
    description: 'Papaya flesh, seeds, and skin',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#ef4444',
  },
  watermelon: {
    category: 'Fruits',
    description: 'Watermelon flesh and rind',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#ef4444',
  },
  'watermelon-rotten': {
    category: 'Fruits',
    description: 'Spoiled or rotting watermelon',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#ef4444',
  },

  // Vegetables
  broccoli: {
    category: 'Vegetables',
    description: 'Broccoli florets and stems',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#10b981',
  },
  cabbage: {
    category: 'Vegetables',
    description: 'Cabbage leaves and head',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#10b981',
  },
  'cabbage-core': {
    category: 'Vegetables',
    description: 'Inner core of cabbage',
    compostable: true,
    avgDecompositionDays: '14-21',
    color: '#10b981',
  },
  'carrot-peel': {
    category: 'Vegetables',
    description: 'Peeled carrot skin',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#10b981',
  },
  cucumber: {
    category: 'Vegetables',
    description: 'Cucumber pieces or whole',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#10b981',
  },
  corn: {
    category: 'Vegetables',
    description: 'Corn kernels, cobs, and husks',
    compostable: true,
    avgDecompositionDays: '30-60',
    color: '#10b981',
  },
  garlic: {
    category: 'Vegetables',
    description: 'Garlic cloves',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#10b981',
  },
  'garlic-skin': {
    category: 'Vegetables',
    description: 'Papery garlic skin and peels',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#10b981',
  },
  kangkong: {
    category: 'Vegetables',
    description: 'Water spinach leaves and stems',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#10b981',
  },
  mushroom: {
    category: 'Vegetables',
    description: 'Mushroom pieces and stems',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#10b981',
  },
  onion: {
    category: 'Vegetables',
    description: 'Onion pieces and peels',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#10b981',
  },
  'onion-skin': {
    category: 'Vegetables',
    description: 'Dry onion skin and peels',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#10b981',
  },
  pechay: {
    category: 'Vegetables',
    description: 'Bok choy / pechay leaves and stems',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#10b981',
  },
  potato: {
    category: 'Vegetables',
    description: 'Potato pieces and peels',
    compostable: true,
    avgDecompositionDays: '21-45',
    color: '#10b981',
  },
  seed: {
    category: 'Vegetables',
    description: 'Seeds from fruits or vegetables',
    compostable: true,
    avgDecompositionDays: '30-90',
    color: '#10b981',
  },
  tomato: {
    category: 'Vegetables',
    description: 'Tomato pieces or whole',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#10b981',
  },

  // Proteins
  bone: {
    category: 'Proteins',
    description: 'Animal bones (chicken, pork, beef)',
    compostable: false,
    avgDecompositionDays: '365+',
    color: '#f59e0b',
  },
  'bone-fish': {
    category: 'Proteins',
    description: 'Fish bones and spines',
    compostable: true,
    avgDecompositionDays: '30-90',
    color: '#f59e0b',
  },
  'chicken-bone': {
    category: 'Proteins',
    description: 'Chicken bones',
    compostable: false,
    avgDecompositionDays: '365+',
    color: '#f59e0b',
  },
  'chicken-skin': {
    category: 'Proteins',
    description: 'Chicken skin and fat',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#f59e0b',
  },
  fish: {
    category: 'Proteins',
    description: 'Fish meat and scraps',
    compostable: true,
    avgDecompositionDays: '7-21',
    color: '#f59e0b',
  },
  meat: {
    category: 'Proteins',
    description: 'Meat scraps and trimmings',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#f59e0b',
  },
  'mussel-shell': {
    category: 'Proteins',
    description: 'Mussel shells',
    compostable: false,
    avgDecompositionDays: '365+',
    color: '#f59e0b',
  },
  shrimp: {
    category: 'Proteins',
    description: 'Shrimp meat',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#f59e0b',
  },
  'shrimp-shell': {
    category: 'Proteins',
    description: 'Shrimp shells and heads',
    compostable: true,
    avgDecompositionDays: '30-90',
    color: '#f59e0b',
  },

  // Eggs
  'egg-scramble': {
    category: 'Eggs',
    description: 'Scrambled or cooked eggs',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#eab308',
  },
  'egg-shell': {
    category: 'Eggs',
    description: 'Eggshells and membrane',
    compostable: true,
    avgDecompositionDays: '30-90',
    color: '#eab308',
  },
  'egg-yolk': {
    category: 'Eggs',
    description: 'Egg yolk only',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#eab308',
  },

  // Grains
  bread: {
    category: 'Grains',
    description: 'Bread pieces and crusts',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#8b5cf6',
  },
  bread_fresh: {
    category: 'Grains',
    description: 'Fresh bread portions',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#8b5cf6',
  },
  bread_in_trash: {
    category: 'Grains',
    description: 'Discarded bread',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#8b5cf6',
  },
  bread_moldy: {
    category: 'Grains',
    description: 'Moldy bread',
    compostable: true,
    avgDecompositionDays: '7-21',
    color: '#8b5cf6',
  },
  bread_rotten: {
    category: 'Grains',
    description: 'Heavily spoiled bread',
    compostable: true,
    avgDecompositionDays: '7-21',
    color: '#8b5cf6',
  },
  bread_stale: {
    category: 'Grains',
    description: 'Hard, stale bread',
    compostable: true,
    avgDecompositionDays: '21-40',
    color: '#8b5cf6',
  },
  bun: {
    category: 'Grains',
    description: 'Buns and bread rolls',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#8b5cf6',
  },
  noodle: {
    category: 'Grains',
    description: 'Noodles and pasta-like items',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#8b5cf6',
  },
  pasta: {
    category: 'Grains',
    description: 'Pasta and spaghetti',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#8b5cf6',
  },
  rice: {
    category: 'Grains',
    description: 'Cooked or uncooked rice',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#8b5cf6',
  },

  // Other
  congee: {
    category: 'Other',
    description: 'Rice porridge',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#6b7280',
  },
  malunggay: {
    category: 'Other',
    description: 'Moringa leaves and stems',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#6b7280',
  },
  pancake: {
    category: 'Other',
    description: 'Pancake pieces',
    compostable: true,
    avgDecompositionDays: '14-21',
    color: '#6b7280',
  },
  tofu: {
    category: 'Other',
    description: 'Tofu and soy products',
    compostable: true,
    avgDecompositionDays: '7-14',
    color: '#6b7280',
  },

  // Non-Organics
  'paper-tissue': {
    category: 'Non-Organics',
    description: 'Used paper tissue or napkin',
    compostable: true,
    avgDecompositionDays: '14-30',
    color: '#94a3b8',
  },
  'plastic-waste': {
    category: 'Non-Organics',
    description: 'Plastic wrappers, bags, or containers',
    compostable: false,
    avgDecompositionDays: '500+',
    color: '#94a3b8',
  },
};

const buildDisposalGuides = (detections = []) => {
  const guides = {};

  detections.forEach((detection) => {
    const className = detection.class;
    if (!className) {
      return;
    }

    const metadata = WASTE_GUIDES[className] || {
      category: 'Unknown',
      description: `No guide available for ${className}`,
      compostable: null,
      avgDecompositionDays: null,
      color: '#9ca3af',
    };

    if (!guides[className]) {
      guides[className] = {
        ...metadata,
        count: 0,
      };
    }

    guides[className].count += 1;
  });

  return guides;
};

module.exports = {
  WASTE_GUIDES,
  buildDisposalGuides,
};
