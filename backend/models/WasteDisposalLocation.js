// backend/models/WasteDisposalLocation.js
const mongoose = require('mongoose');

const WasteDisposalLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (coords) {
            return (
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 && // longitude
              coords[1] >= -90 &&
              coords[1] <= 90 // latitude
            );
          },
          message:
            'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.',
        },
      },
    },
    acceptedWasteTypes: [
      {
        type: String,
        required: true,
      },
    ],
    facilityType: {
      type: String,
      enum: [
        'recycling_center',
        'composting_facility',
        'collection_point',
        'donation_center',
        'waste_management',
      ],
      required: true,
    },
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    contactInfo: {
      phone: String,
      email: String,
      website: String,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    acceptsPublicDropOff: {
      type: Boolean,
      default: true,
    },
    fees: {
      hasFees: {
        type: Boolean,
        default: false,
      },
      description: String,
    },
    images: [String],
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
WasteDisposalLocationSchema.index({ location: '2dsphere' });
WasteDisposalLocationSchema.index({ acceptedWasteTypes: 1 });
WasteDisposalLocationSchema.index({ facilityType: 1 });
WasteDisposalLocationSchema.index({ isActive: 1 });

// Method to find nearest locations
WasteDisposalLocationSchema.statics.findNearby = function (
  longitude,
  latitude,
  wasteTypes,
  maxDistance = 20000,
  limit = 10
) {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance, // in meters
      },
    },
    isActive: true,
  };

  if (wasteTypes && wasteTypes.length > 0) {
    query.acceptedWasteTypes = { $in: wasteTypes };
  }

  return this.find(query).limit(limit);
};

module.exports = mongoose.model('WasteDisposalLocation', WasteDisposalLocationSchema);