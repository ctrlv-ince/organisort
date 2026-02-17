// backend/routes/disposal-location-routes.js
const express = require('express');
const router = express.Router();
const { unifiedAuth, admin } = require('../middleware/auth-middleware');
const {
  getNearbyLocations,
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getRecommendedLocations,
} = require('../controllers/disposal-location-controller');

router.get('/nearby', unifiedAuth, getNearbyLocations);
router.get('/recommended', unifiedAuth, getRecommendedLocations);
router.get('/', unifiedAuth, getAllLocations);
router.get('/:id', unifiedAuth, getLocationById);

router.post('/', unifiedAuth, admin, createLocation);
router.patch('/:id', unifiedAuth, admin, updateLocation);
router.delete('/:id', unifiedAuth, admin, deleteLocation);

module.exports = router;