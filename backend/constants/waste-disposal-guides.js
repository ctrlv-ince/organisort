const WASTE_DISPOSAL_GUIDES = {
  // ── Fruits ────────────────────────────────────────────────────────────────
  apple: {
    bin: 'compost',
    instructions: [
      'Remove any stickers or non-organic materials.',
      'Place whole or cut apple pieces into your compost or food-waste bin.',
      'Cover with dry browns (paper, leaves) to reduce odour.',
    ],
    notes: 'Cutting into smaller pieces speeds up decomposition.',
    decompositionDays: 21,
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
  'apple-peel': {
    bin: 'compost',
    instructions: [
      'Place apple peels directly into your compost or food-waste bin.',
      'Mix with drier compostables to avoid clumping.',
    ],
    notes: 'Peels break down quickly — great for activating a new compost pile.',
    decompositionDays: 10,
  },
  avocado: {
    bin: 'compost',
    instructions: [
      'Separate the flesh, skin, and pit.',
      'Flesh and skin go in the compost bin.',
      'The pit can be composted but takes much longer — consider drying and grinding it first.',
    ],
    notes: 'Avocado pits can take months to break down whole.',
    decompositionDays: 30,
  },
  'banana-peel': {
    bin: 'compost',
    instructions: [
      'Remove any stickers or non-organic materials attached to the peel.',
      'Place the peel in your compost bin or municipal organics collection.',
      'Mix with dry compostables such as paper or leaves to reduce odour.',
    ],
    notes: 'Cutting the peel into smaller pieces can speed up breakdown.',
    decompositionDays: 14,
  },
  'bitten-apple': {
    bin: 'compost',
    instructions: [
      'Place the partially eaten apple directly in your compost or food-waste bin.',
      'Cover with dry browns (paper, leaves) to reduce odour.',
    ],
    notes: 'Treat the same as a whole apple — chop for faster decomposition.',
    decompositionDays: 21,
  },
  calamansi: {
    bin: 'compost',
    instructions: [
      'Place whole fruit or peels directly into your compost bin.',
      'Mix with other food scraps.',
    ],
    notes: 'Citrus peels decompose more slowly — chop them up to speed the process.',
    decompositionDays: 21,
  },
  mango: {
    bin: 'compost',
    instructions: [
      'Separate the flesh from the skin and seed.',
      'Flesh and skin go directly in the compost bin.',
      'The seed/pit takes much longer — crush or cut it before composting.',
    ],
    notes: 'Mango pits can take several months to decompose whole.',
    decompositionDays: 21,
  },
  orange: {
    bin: 'compost',
    instructions: [
      'Place orange segments or the whole fruit in your compost bin.',
      'Chop into smaller pieces for faster breakdown.',
    ],
    notes: 'Citrus adds acidity — balance with neutral browns in the compost.',
    decompositionDays: 21,
  },
  'orange-peel': {
    bin: 'compost',
    instructions: [
      'Tear or cut peels into smaller strips before composting.',
      'Add to compost bin with other food waste.',
    ],
    notes: 'Citrus oils can slow worm activity in vermicompost — use sparingly in worm bins.',
    decompositionDays: 45,
  },
  pear: {
    bin: 'compost',
    instructions: [
      'Place whole or sliced pear in the compost bin.',
      'Remove any stickers first.',
    ],
    decompositionDays: 21,
  },
  'pear-core': {
    bin: 'compost',
    instructions: [
      'Place the pear core directly into your compost or food-waste bin.',
    ],
    decompositionDays: 21,
  },
  'pear-peel': {
    bin: 'compost',
    instructions: [
      'Add pear peels to your compost or food-waste bin.',
    ],
    decompositionDays: 10,
  },
  pineapple: {
    bin: 'compost',
    instructions: [
      'Chop the skin and core into smaller pieces before composting.',
      'Flesh can be placed directly in the compost bin.',
    ],
    notes: 'The tough outer skin takes longer — cut it up to help it break down.',
    decompositionDays: 45,
  },

  // ── Vegetables ───────────────────────────────────────────────────────────
  broccoli: {
    bin: 'compost',
    instructions: [
      'Place raw or cooked broccoli scraps in the compost bin.',
      'Chop thick stems into smaller pieces.',
    ],
    decompositionDays: 10,
  },
  cabbage: {
    bin: 'compost',
    instructions: [
      'Tear or chop cabbage leaves into smaller pieces.',
      'Place in the compost or food-waste bin.',
    ],
    notes: 'Cabbage breaks down quickly due to its high moisture content.',
    decompositionDays: 10,
  },
  'cabbage-core': {
    bin: 'compost',
    instructions: [
      'Chop the dense cabbage core into smaller chunks before composting.',
      'Add to your compost or food-waste bin.',
    ],
    notes: 'The core is denser — cutting it up speeds decomposition significantly.',
    decompositionDays: 14,
  },
  'carrot-peel': {
    bin: 'compost',
    instructions: [
      'Place carrot peels directly into your compost or food-waste bin.',
      'Mix with drier compostables.',
    ],
    notes: 'Carrot peels decompose quickly and are an excellent compost addition.',
    decompositionDays: 10,
  },
  cucumber: {
    bin: 'compost',
    instructions: [
      'Place cucumber slices or peels directly in the compost bin.',
    ],
    decompositionDays: 10,
  },
  garlic: {
    bin: 'compost',
    instructions: [
      'Add garlic cloves to the compost bin.',
    ],
    notes: 'Garlic has antimicrobial properties — use in moderation in worm bins.',
    decompositionDays: 21,
  },
  'garlic-skin': {
    bin: 'compost',
    instructions: [
      'Add papery garlic skins directly to the compost bin.',
      'They count as a dry brown material.',
    ],
    notes: 'Garlic skin is very light — mix with wetter greens for balance.',
    decompositionDays: 10,
  },
  kangkong: {
    bin: 'compost',
    instructions: [
      'Place water spinach leaves and stems directly in the compost bin.',
      'Chop thick stems for faster breakdown.',
    ],
    decompositionDays: 7,
  },
  mushroom: {
    bin: 'compost',
    instructions: [
      'Add mushroom pieces and stems to the compost bin.',
    ],
    notes: 'Mushrooms break down quickly and add beneficial fungi to compost.',
    decompositionDays: 7,
  },
  onion: {
    bin: 'compost',
    instructions: [
      'Add onion pieces to the compost bin.',
    ],
    notes: 'Strong odour — bury onion scraps within the compost pile.',
    decompositionDays: 21,
  },
  'onion-skin': {
    bin: 'compost',
    instructions: [
      'Add dry onion skins directly to the compost bin.',
      'They act as a brown / carbon material.',
    ],
    notes: 'Onion skins are slow to break down — tear them up first.',
    decompositionDays: 14,
  },
  pechay: {
    bin: 'compost',
    instructions: [
      'Place pechay / bok choy leaves and stems directly in the compost bin.',
    ],
    notes: 'High moisture content — mix with dry browns.',
    decompositionDays: 7,
  },
  potato: {
    bin: 'compost',
    instructions: [
      'Add raw potato peels and scraps to the compost bin.',
      'Avoid adding cooked potatoes in open compost to deter pests.',
    ],
    notes: 'Ensure potato pieces do not sprout in the compost.',
    decompositionDays: 30,
  },
  seed: {
    bin: 'compost',
    instructions: [
      'Add seeds from fruits or vegetables to the compost bin.',
      'Crush or chop larger seeds to speed up decomposition.',
    ],
    notes: 'Some seeds may survive composting and sprout — hot composting can prevent this.',
    decompositionDays: 60,
  },
  tomato: {
    bin: 'compost',
    instructions: [
      'Place tomato pieces or whole tomatoes in the compost bin.',
    ],
    notes: 'Tomato seeds may survive composting and sprout later — not a concern for most.',
    decompositionDays: 10,
  },

  // ── Proteins ──────────────────────────────────────────────────────────────
  bone: {
    bin: 'residual',
    instructions: [
      'Large animal bones (pork, beef) are not suitable for standard compost.',
      'Place in the residual/general waste bin.',
      'Check if your local facility accepts bones for specialised processing.',
    ],
    notes: 'Some industrial composting facilities accept bones — check local rules.',
    decompositionDays: 730,
  },
  'bone-fish': {
    bin: 'compost',
    instructions: [
      'Fish bones can be added to compost in small quantities.',
      'Bury them deep inside the pile to minimise odour and pests.',
    ],
    notes: 'Fish bones add calcium and phosphorus to compost.',
    decompositionDays: 60,
  },
  'chicken-bone': {
    bin: 'residual',
    instructions: [
      'Chicken bones are not suitable for standard home composting.',
      'Place in the residual/general waste bin.',
      'Check if your local facility accepts bones for specialised processing.',
    ],
    notes: 'Industrial composting or bone-meal facilities may accept chicken bones.',
    decompositionDays: 730,
  },
  'chicken-skin': {
    bin: 'compost',
    instructions: [
      'Add chicken skin scraps to a closed compost bin.',
      'Bury well to prevent attracting pests.',
    ],
    notes: 'Meat/fat scraps should be used in closed, aerated bins only.',
    decompositionDays: 21,
  },
  fish: {
    bin: 'compost',
    instructions: [
      'Place fish scraps in a closed compost bin.',
      'Bury deep within the pile to control odour.',
      'Alternatively, use municipal organics collection if available.',
    ],
    notes: 'Fish is a nitrogen-rich activator for compost.',
    decompositionDays: 14,
  },
  meat: {
    bin: 'compost',
    instructions: [
      'Use a closed compost bin only — open bins attract pests.',
      'Bury meat scraps deep within the pile.',
      'Municipal organics (green bin) collection is a safer option.',
    ],
    notes: 'Avoid adding large quantities at once.',
    decompositionDays: 21,
  },
  'mussel-shell': {
    bin: 'special handling',
    instructions: [
      'Crush or grind shells into smaller pieces.',
      'Add crushed shells to compost in small amounts — they add calcium.',
      'Alternatively, check if local facilities accept shells for garden lime production.',
    ],
    notes: 'Whole shells take years to break down — always crush first.',
    decompositionDays: 730,
  },
  shrimp: {
    bin: 'compost',
    instructions: [
      'Place shrimp meat in the compost bin.',
      'Bury to reduce odour.',
    ],
    decompositionDays: 10,
  },
  'shrimp-shell': {
    bin: 'compost',
    instructions: [
      'Crush shrimp shells before adding to compost.',
      'They add chitin which benefits soil health.',
    ],
    notes: 'Rinse shells briefly to remove excess salt if the shrimp was salted.',
    decompositionDays: 60,
  },

  // ── Eggs ──────────────────────────────────────────────────────────────────
  'egg-scramble': {
    bin: 'compost',
    instructions: [
      'Add cooked egg scraps to a closed compost bin.',
      'Bury within the pile to avoid attracting flies.',
    ],
    decompositionDays: 10,
  },
  'egg-shell': {
    bin: 'compost',
    instructions: [
      'Rinse quickly to remove leftover egg white if needed.',
      'Crush shells into small pieces before disposal.',
      'Add to compost bin to support aeration and mineral content.',
    ],
    notes: 'Avoid placing large shell halves in worm bins all at once.',
    decompositionDays: 90,
  },
  // Legacy key alias (some older detections may use this spelling)
  eggshell: {
    bin: 'compost',
    instructions: [
      'Rinse quickly to remove leftover egg white if needed.',
      'Crush shells into small pieces before disposal.',
      'Add to compost bin to support aeration and mineral content.',
    ],
    notes: 'Avoid placing large shell halves in worm bins all at once.',
    decompositionDays: 90,
  },
  'egg-yolk': {
    bin: 'compost',
    instructions: [
      'Add egg yolk to a closed compost bin.',
      'Bury within the pile to minimise odour.',
    ],
    decompositionDays: 10,
  },

  // ── Grains ────────────────────────────────────────────────────────────────
  bread: {
    bin: 'compost',
    instructions: [
      'Tear bread into small pieces before composting.',
      'Use a closed bin to prevent attracting rodents.',
    ],
    notes: 'Mouldy bread is fine to compost — mould helps break it down.',
    decompositionDays: 21,
  },
  bun: {
    bin: 'compost',
    instructions: [
      'Break buns into smaller pieces and add to a closed compost bin.',
    ],
    decompositionDays: 21,
  },
  noodle: {
    bin: 'compost',
    instructions: [
      'Add cooked or uncooked noodle scraps to a closed compost bin.',
      'Avoid large tangled clumps — mix in well.',
    ],
    decompositionDays: 21,
  },
  pasta: {
    bin: 'compost',
    instructions: [
      'Add pasta to a closed compost bin.',
      'Break into smaller pieces if possible.',
    ],
    decompositionDays: 21,
  },
  rice: {
    bin: 'compost',
    instructions: [
      'Add cooked or uncooked rice to a closed compost bin.',
      'Cooked rice can attract pests — bury it well within the pile.',
    ],
    notes: 'Uncooked rice is preferable in open compost bins.',
    decompositionDays: 21,
  },

  // ── Other ─────────────────────────────────────────────────────────────────
  congee: {
    bin: 'compost',
    instructions: [
      'Add congee/rice porridge to a closed compost bin.',
      'Bury well to reduce odour and pest attraction.',
    ],
    decompositionDays: 10,
  },
  malunggay: {
    bin: 'compost',
    instructions: [
      'Place moringa leaves and stems directly in the compost bin.',
      'Moringa is an excellent nitrogen-rich green material.',
    ],
    decompositionDays: 7,
  },
  pancake: {
    bin: 'compost',
    instructions: [
      'Break pancakes into smaller pieces and add to a closed compost bin.',
    ],
    decompositionDays: 14,
  },
  tofu: {
    bin: 'compost',
    instructions: [
      'Crumble tofu and add to compost bin.',
      'High protein content makes it a good compost activator.',
    ],
    notes: 'Bury tofu scraps to avoid attracting pests.',
    decompositionDays: 10,
  },

  // ── Non-organics ─────────────────────────────────────────────────────────
  'paper-tissue': {
    bin: 'compost',
    instructions: [
      'If unsoiled by chemicals, place used paper tissue in the compost bin.',
      'Heavily soiled tissues (e.g. with cleaning products) go in residual waste.',
    ],
    notes: 'Paper tissue counts as a brown/carbon material in compost.',
    decompositionDays: 21,
  },
  'plastic-waste': {
    bin: 'residual',
    instructions: [
      'Place plastic waste in the residual/general waste bin.',
      'If the plastic is marked recyclable, check your local recycling guidelines.',
      'Do NOT add plastic to compost or organic waste bins.',
    ],
    notes: 'Plastic does not decompose naturally. Always separate from organic waste.',
  },
  'plastic-bottle': {
    bin: 'recyclable',
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
  notes: 'No specific guide is available for this item — follow local waste policy.',
};

module.exports = {
  WASTE_DISPOSAL_GUIDES,
  DEFAULT_DISPOSAL_GUIDE,
};