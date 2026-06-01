const express = require('express');
const { getProfile, updateProfile, getMyVehicles } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.get('/vehicles', protect, getMyVehicles);

module.exports = router;