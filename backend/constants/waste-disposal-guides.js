const WASTE_DISPOSAL_GUIDES = {
  'banana-peel': {
    bin: 'compost',
    instructions: [
      'Remove any stickers or non-organic materials attached to the peel.',
      'Place the peel in your compost bin or municipal organics collection.',
      'Mix with dry compostables such as paper or leaves to reduce odor.',
    ],
    notes: 'Cutting the peel into smaller pieces can speed up breakdown.',
    decompositionDays: 14,
  },
  'apple-core': {
    bin: 'compost',
    instructions: [
      'Check for non-compostable additions such as plastic picks or wrappers.',
      'Discard the apple core into a compost or food-waste bin.',
      'If backyard composting, cover with browns to balance moisture.',
    ],
    notes: 'Apple seeds are compostable but decompose slower than flesh.',
    decompositionDays: 21,
  },
  'eggshell': {
    bin: 'compost',
    instructions: [
      'Rinse quickly to remove leftover egg white if needed.',
      'Crush shells into small pieces before disposal.',
      'Add to compost bin to support aeration and mineral content.',
    ],
    notes: 'Avoid placing large shell halves in worm bins all at once.',
    decompositionDays: 90,
  },
  'plastic-bottle': {
    bin: 'special handling',
    instructions: [
      'Empty and rinse the bottle to remove liquid residue.',
      'Flatten the bottle if your local recycler accepts compacted plastics.',
      'Place it in the correct recycling stream based on local guidelines.',
    ],
    notes: 'Keep caps on only if your local recycling program allows it.',
  },
  'food-waste': {
    bin: 'compost',
    instructions: [
      'Separate food scraps from non-organic packaging.',
      'Drain excess liquids before placing scraps in organics bin.',
      'Secure the compost caddy or bag to avoid pests.',
    ],
  },
};

const DEFAULT_DISPOSAL_GUIDE = {
  bin: 'residual',
  instructions: [
    'Check your local waste segregation rules for this item.',
    'If material type is uncertain, keep it separate from recyclables.',
    'Dispose through the residual bin or contact your local facility for guidance.',
  ],
  notes: 'Guidance is unavailable for this class label, so local policy should be followed.',
};

module.exports = {
  WASTE_DISPOSAL_GUIDES,
  DEFAULT_DISPOSAL_GUIDE,
};
