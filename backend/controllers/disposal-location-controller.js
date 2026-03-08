// backend/controllers/disposal-location-controller.js
const WasteDisposalLocation = require('../models/WasteDisposalLocation');
const { getPaginationParams } = require('../utils/pagination');

// ---------------------------------------------------------------------------
// Synonym map: expands specific detection class names into the broader category
// keywords that seeded locations actually use in acceptedWasteTypes.
// e.g. "potato" → also searches for "vegetable" and "food-waste"
// ---------------------------------------------------------------------------
const WASTE_TYPE_SYNONYMS = {
  // Vegetables
  potato: ['vegetable', 'food-waste'], tomato: ['vegetable', 'food-waste'],
  broccoli: ['vegetable', 'food-waste'], cucumber: ['vegetable', 'food-waste'],
  garlic: ['vegetable', 'food-waste'], onion: ['vegetable', 'food-waste'],
  mushroom: ['vegetable', 'food-waste'], cabbage: ['vegetable', 'food-waste'],
  'cabbage-core': ['vegetable', 'food-waste'], 'carrot-peel': ['vegetable', 'food-waste'],
  'garlic-skin': ['vegetable', 'food-waste'], kangkong: ['vegetable', 'food-waste'],
  'onion-skin': ['vegetable', 'food-waste'], pechay: ['vegetable', 'food-waste'],
  seed: ['vegetable', 'food-waste'],
  // Fruits
  apple: ['fruit', 'food-waste'], 'apple-core': ['fruit', 'food-waste'],
  'apple-peel': ['fruit', 'food-waste'], 'banana-peel': ['fruit', 'food-waste'],
  'bitten-apple': ['fruit', 'food-waste'], mango: ['fruit', 'food-waste'],
  orange: ['fruit', 'food-waste'], 'orange-peel': ['fruit', 'food-waste'],
  pear: ['fruit', 'food-waste'], 'pear-core': ['fruit', 'food-waste'],
  'pear-peel': ['fruit', 'food-waste'], pineapple: ['fruit', 'food-waste'],
  avocado: ['fruit', 'food-waste'], calamansi: ['fruit', 'food-waste'],
  papaya: ['fruit', 'food-waste'], watermelon: ['fruit', 'food-waste'],
  'watermelon-rotten': ['fruit', 'food-waste'],
  // Proteins
  meat: ['protein', 'food-waste'], fish: ['protein', 'food-waste'],
  'bone-fish': ['protein', 'food-waste'], shrimp: ['protein', 'food-waste'],
  'chicken-skin': ['protein', 'food-waste'], 'chicken-bone': ['protein', 'food-waste'],
  'shrimp-shell': ['protein', 'food-waste'], bone: ['protein', 'food-waste'],
  'mussel-shell': ['protein', 'food-waste'],
  // Grains
  rice: ['grain', 'food-waste'], bread: ['grain', 'food-waste'],
  noodle: ['grain', 'food-waste'], pasta: ['grain', 'food-waste'],
  bun: ['grain', 'food-waste'], bread_fresh: ['grain', 'food-waste'],
  bread_in_trash: ['grain', 'food-waste'], bread_moldy: ['grain', 'food-waste'],
  bread_rotten: ['grain', 'food-waste'], bread_stale: ['grain', 'food-waste'],
  // Eggs / Other
  'egg-shell': ['food-waste'], 'egg-scramble': ['food-waste'],
  eggshell: ['food-waste'], 'egg-yolk': ['food-waste'],
  tofu: ['food-waste'], congee: ['food-waste'],
  malunggay: ['vegetable', 'food-waste'], pancake: ['food-waste'],
  // Non-organics
  'paper-tissue': ['paper', 'food-waste'],
  'plastic-waste': ['plastic', 'non-recyclable'],
};

const expandWasteTypes = (types) => {
  const expanded = new Set(types);
  types.forEach((t) => {
    (WASTE_TYPE_SYNONYMS[t] || []).forEach((s) => expanded.add(s));
  });
  return [...expanded];
};

// ---------------------------------------------------------------------------

const getNearbyLocations = async (req, res, next) => {
  try {
    const { latitude, longitude, wasteTypes, maxDistance = 20000, limit = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude',
      });
    }

    let wasteTypesArray = null;
    if (wasteTypes) {
      const raw = Array.isArray(wasteTypes)
        ? wasteTypes
        : wasteTypes.split(',').map((t) => t.trim()).filter(Boolean);
      if (raw.length > 0) wasteTypesArray = expandWasteTypes(raw);
    }

    const locations = await WasteDisposalLocation.findNearby(
      lng,
      lat,
      wasteTypesArray,
      parseInt(maxDistance),
      parseInt(limit)
    );

    const locationsWithDistance = locations.map((loc) => {
      const distance = calculateDistance(
        lat,
        lng,
        loc.location.coordinates[1],
        loc.location.coordinates[0]
      );

      return {
        ...loc.toObject(),
        distance: Math.round(distance * 100) / 100,
        distanceText: formatDistance(distance),
      };
    });

    res.json({
      success: true,
      data: locationsWithDistance,
      count: locationsWithDistance.length,
    });
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    next(error);
  }
};

const getAllLocations = async (req, res, next) => {
  try {
    const { facilityType, isActive = 'true' } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);

    const query = { isActive: isActive === 'true' };

    if (facilityType) {
      query.facilityType = facilityType;
    }

    const [locations, total] = await Promise.all([
      WasteDisposalLocation.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      WasteDisposalLocation.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: locations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    next(error);
  }
};

const getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const location = await WasteDisposalLocation.findById(id);

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found',
      });
    }

    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    next(error);
  }
};

const createLocation = async (req, res, next) => {
  try {
    const locationData = {
      ...req.body,
      addedBy: req.user.id || req.user._id,
      isVerified: req.user.role === 'admin',
    };

    if (req.user.role === 'admin') {
      locationData.verifiedBy = req.user.id || req.user._id;
    }

    const location = await WasteDisposalLocation.create(locationData);

    res.status(201).json({
      success: true,
      message: 'Disposal location created successfully',
      data: location,
    });
  } catch (error) {
    console.error('Error creating location:', error);
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const location = await WasteDisposalLocation.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found',
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: location,
    });
  } catch (error) {
    console.error('Error updating location:', error);
    next(error);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const location = await WasteDisposalLocation.findByIdAndDelete(id);

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found',
      });
    }

    res.json({
      success: true,
      message: 'Location deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting location:', error);
    next(error);
  }
};

const getRecommendedLocations = async (req, res, next) => {
  try {
    const { latitude, longitude, wasteTypes } = req.query;

    // wasteTypes is OPTIONAL — show nearby locations even without it
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude',
      });
    }

    // Build expanded waste type list (specific class → broad category synonyms)
    let wasteTypesArray = null;
    if (wasteTypes) {
      const raw = Array.isArray(wasteTypes)
        ? wasteTypes
        : wasteTypes.split(',').map((t) => t.trim()).filter(Boolean);
      if (raw.length > 0) wasteTypesArray = expandWasteTypes(raw);
    }

    // First pass: try with expanded waste types
    let locations = await WasteDisposalLocation.findNearby(lng, lat, wasteTypesArray, 50000, 10);
    let usedFallbackNearbySearch = false;

    // Fallback 1: try without waste type filter
    if (locations.length === 0) {
      locations = await WasteDisposalLocation.findNearby(lng, lat, null, 50000, 10);
      usedFallbackNearbySearch = locations.length > 0;
    }

    // Fallback 2: if still no locations within 50km, return any active locations (ignoring distance limit)
    if (locations.length === 0) {
      locations = await WasteDisposalLocation.find({ isActive: true })
        .limit(10);

      // We need to calculate distance up front to sort them manually
      // since $near aggregation does this automatically
      locations.sort((a, b) => {
        const distA = calculateDistance(lat, lng, a.location.coordinates[1], a.location.coordinates[0]);
        const distB = calculateDistance(lat, lng, b.location.coordinates[1], b.location.coordinates[0]);
        return distA - distB;
      });
      usedFallbackNearbySearch = true;
    }

    if (locations.length === 0) {
      return res.json({
        success: true,
        message: 'No disposal locations found anywhere',
        data: [],
        recommendation: {
          wasteTypes: wasteTypesArray,
          alternativeMessage:
            'Please check with your local waste management authority for proper disposal methods.',
        },
      });
    }

    const recommendations = locations.map((loc, index) => {
      const distance = calculateDistance(
        lat,
        lng,
        loc.location.coordinates[1],
        loc.location.coordinates[0]
      );

      return {
        ...loc.toObject(),
        distance: Math.round(distance * 100) / 100,
        distanceText: formatDistance(distance),
        priority: index + 1,
        recommendation: generateRecommendation(loc, distance, wasteTypesArray || []),
      };
    });

    res.json({
      success: true,
      message: usedFallbackNearbySearch
        ? 'No exact waste-type match found nearby. Showing closest active drop-off points instead.'
        : undefined,
      data: recommendations,
      wasteTypes: wasteTypesArray,
      nearestLocation: recommendations[0],
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    next(error);
  }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

function generateRecommendation(location, distance, wasteTypes) {
  const facilityNames = {
    recycling_center: 'recycling center',
    composting_facility: 'composting facility',
    collection_point: 'collection point',
    donation_center: 'donation center',
    waste_management: 'waste management facility',
  };

  let message = wasteTypes.length > 0
    ? `This ${facilityNames[location.facilityType] || 'facility'} accepts ${wasteTypes.join(', ')} waste`
    : `This ${facilityNames[location.facilityType] || 'facility'} is a nearby drop-off point`;

  if (distance < 1) {
    message += ' and is very close to you (less than 1km).';
  } else if (distance < 5) {
    message += ' and is nearby.';
  } else {
    message += '.';
  }

  if (location.acceptsPublicDropOff) {
    message += ' Public drop-off is available.';
  }

  if (location.fees && location.fees.hasFees) {
    message += ` Note: ${location.fees.description || 'Fees may apply'}`;
  }

  return message;
}

module.exports = {
  getNearbyLocations,
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getRecommendedLocations,
};