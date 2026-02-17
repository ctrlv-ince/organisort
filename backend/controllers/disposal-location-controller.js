// backend/controllers/disposal-location-controller.js
const WasteDisposalLocation = require('../models/WasteDisposalLocation');
const { getPaginationParams } = require('../utils/pagination');

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
      wasteTypesArray = Array.isArray(wasteTypes)
        ? wasteTypes
        : wasteTypes.split(',').map((t) => t.trim());
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

    if (!latitude || !longitude || !wasteTypes) {
      return res.status(400).json({
        success: false,
        error: 'Latitude, longitude, and wasteTypes are required',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const wasteTypesArray = Array.isArray(wasteTypes)
      ? wasteTypes
      : wasteTypes.split(',').map((t) => t.trim());

    const locations = await WasteDisposalLocation.findNearby(lng, lat, wasteTypesArray, 50000, 10);

    if (locations.length === 0) {
      return res.json({
        success: true,
        message: 'No disposal locations found for these waste types nearby',
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
        recommendation: generateRecommendation(loc, distance, wasteTypesArray),
      };
    });

    res.json({
      success: true,
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
  const distance = R * c;

  return distance;
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

  let message = `This ${facilityNames[location.facilityType] || 'facility'} accepts ${wasteTypes.join(', ')} waste`;

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

  if (location.fees.hasFees) {
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