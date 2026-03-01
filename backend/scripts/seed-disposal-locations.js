const path = require('path');
const mongoose = require('mongoose');
const WasteDisposalLocation = require('../models/WasteDisposalLocation');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const locations = [
  {
    name: 'Taguig City Environment and Natural Resources Office (CENRO)',
    address: 'Taguig City Hall Complex, Cayetano Blvd, Barangay Ususan, Taguig, Metro Manila',
    location: {
      type: 'Point',
      coordinates: [121.0663, 14.5266], // [lng, lat]
    },
    acceptedWasteTypes: ['banana-peel', 'apple-core', 'orange-peel', 'vegetable', 'leaf'],
    facilityType: 'waste_management',
    operatingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
    },
    contactInfo: {
      phone: '+63 2 8642 3582',
      website: 'https://www.taguig.gov.ph',
    },
    description: 'City government environmental office that coordinates waste segregation and scheduled disposal programs.',
    isActive: true,
    acceptsPublicDropOff: true,
    fees: { hasFees: false },
  },
  {
    name: 'Barangay Pinagsama Materials Recovery Facility',
    address: 'CP Garcia Ave, Barangay Pinagsama, Taguig, Metro Manila',
    location: {
      type: 'Point',
      coordinates: [121.0502, 14.5127],
    },
    acceptedWasteTypes: ['banana-peel', 'apple-core', 'orange-peel', 'vegetable', 'leaf'],
    facilityType: 'recycling_center',
    operatingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '08:00', close: '12:00' },
    },
    contactInfo: {
      phone: '+63 2 8837 0747',
    },
    description: 'Barangay-level materials recovery facility for segregated recyclables and biodegradable household waste.',
    isActive: true,
    acceptsPublicDropOff: true,
    fees: { hasFees: false },
  },
  {
    name: 'Barangay Lower Bicutan Materials Recovery Facility',
    address: 'General Santos Ave, Barangay Lower Bicutan, Taguig, Metro Manila',
    location: {
      type: 'Point',
      coordinates: [121.0548, 14.4869],
    },
    acceptedWasteTypes: ['banana-peel', 'apple-core', 'orange-peel', 'vegetable', 'leaf'],
    facilityType: 'collection_point',
    operatingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '08:00', close: '12:00' },
    },
    contactInfo: {
      phone: '+63 2 8828 6305',
    },
    description: 'Collection point serving households in Lower Bicutan for scheduled drop-off of segregated waste streams.',
    isActive: true,
    acceptsPublicDropOff: true,
    fees: { hasFees: false },
  },
  {
    name: 'Barangay Western Bicutan Materials Recovery Facility',
    address: 'Lawton Ave, Barangay Western Bicutan, Taguig, Metro Manila',
    location: {
      type: 'Point',
      coordinates: [121.0424, 14.5208],
    },
    acceptedWasteTypes: ['banana-peel', 'apple-core', 'orange-peel', 'vegetable', 'leaf'],
    facilityType: 'recycling_center',
    operatingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '08:00', close: '12:00' },
    },
    contactInfo: {
      phone: '+63 2 8519 2577',
    },
    description: 'Barangay facility that receives recyclables and compostable waste from nearby residential communities.',
    isActive: true,
    acceptsPublicDropOff: true,
    fees: { hasFees: false },
  },
  {
    name: 'Barangay Fort Bonifacio Materials Recovery Facility',
    address: '5th Ave corner 23rd St, Barangay Fort Bonifacio, Taguig, Metro Manila',
    location: {
      type: 'Point',
      coordinates: [121.0464, 14.5511],
    },
    acceptedWasteTypes: ['banana-peel', 'apple-core', 'orange-peel', 'vegetable', 'leaf'],
    facilityType: 'collection_point',
    operatingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
    },
    contactInfo: {
      phone: '+63 2 8816 1240',
    },
    description: 'Drop-off and staging point for segregated waste in and around Bonifacio Global City.',
    isActive: true,
    acceptsPublicDropOff: true,
    fees: { hasFees: false },
  },
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined. Add it to backend/.env before running this script.');
  }

  await mongoose.connect(mongoUri);
  await WasteDisposalLocation.insertMany(locations);
  console.log('✅ Seeded Taguig waste disposal locations');
  process.exit(0);
}

seed();
