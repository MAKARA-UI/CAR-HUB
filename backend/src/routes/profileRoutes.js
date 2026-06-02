const express = require('express');
const { getProfile, updateProfile, updatePushToken, getMyVehicles } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.put('/push-token', protect, updatePushToken);
router.get('/vehicles', protect, getMyVehicles);

module.exports = router;
