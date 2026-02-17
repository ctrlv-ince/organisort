const mongoose = require('mongoose');
const WasteDisposalLocation = require('../models/WasteDisposalLocation');
require('dotenv').config();

const locations = [
  {
    name: "Quezon City Ecological Waste Management",
    address: "Commonwealth Ave, Quezon City, Metro Manila",
    location: {
      type: "Point",
      coordinates: [121.0509, 14.6760] // [lng, lat]
    },
    acceptedWasteTypes: ["banana-peel", "apple-core", "orange-peel", "vegetable"],
    facilityType: "composting_facility",
    operatingHours: {
      monday: { open: "08:00", close: "17:00" },
      tuesday: { open: "08:00", close: "17:00" },
      wednesday: { open: "08:00", close: "17:00" },
      thursday: { open: "08:00", close: "17:00" },
      friday: { open: "08:00", close: "17:00" },
    },
    contactInfo: {
      phone: "+63 2 1234 5678",
    },
    description: "Main composting facility for organic waste",
    isActive: true,
    acceptsPublicDropOff: true,
    fees: { hasFees: false }
  },
  // Add more locations...
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await WasteDisposalLocation.insertMany(locations);
  console.log('✅ Seeded locations');
  process.exit(0);
}

seed();