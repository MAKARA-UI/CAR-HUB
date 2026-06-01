const express = require('express');
const { 
  createBooking, 
  getMyBookings, 
  getDriverRequests, 
  updateBookingStatus, 
  getBookingById,
  addReview 
} = require('../controllers/bookingController');
const { protect, isDriver } = require('../middleware/authMiddleware');
const { validateBooking } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/', protect, validateBooking, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/driver-requests', protect, isDriver, getDriverRequests);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, updateBookingStatus);
router.post('/:id/review', protect, addReview);

module.exports = router;