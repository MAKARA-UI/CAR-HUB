const { db } = require('../config/firebase');
const { sendPushNotification } = require('../services/notificationService');

const sendUserBookingNotification = async (userId, notification) => {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) return;

  const { pushToken } = userDoc.data();
  if (!pushToken) return;

  await sendPushNotification({
    to: pushToken,
    ...notification,
  });
};

const getBookingReview = async (bookingId) => {
  const reviewSnapshot = await db.collection('reviews')
    .where('bookingId', '==', bookingId)
    .limit(1)
    .get();

  if (reviewSnapshot.empty) return null;

  const reviewDoc = reviewSnapshot.docs[0];
  return {
    id: reviewDoc.id,
    ...reviewDoc.data(),
  };
};

// Create new booking
const createBooking = async (req, res) => {
  try {
    const { vehicleId, pickupLocation, destination, date, price, category, serviceMode, departureTime, payment, notes } = req.body;
    
    // Check if vehicle exists
    const vehicleDoc = await db.collection('vehicles').doc(vehicleId).get();
    
    if (!vehicleDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vehicle not found' 
      });
    }
    
    const vehicleData = vehicleDoc.data();
    
    const bookingData = {
      customerId: req.user.id,
      driverId: vehicleData.driverId,
      vehicleId,
      pickupLocation,
      destination,
      date: new Date(date).toISOString(),
      price: parseFloat(price),
      category: category || vehicleData.category || 'local',
      serviceMode: serviceMode || vehicleData.serviceMode || 'individual',
      departureTime: departureTime || vehicleData.departureTime || '',
      payment: payment || {
        method: 'CASH',
        methodLabel: 'Cash',
        status: 'CASH_PENDING',
        statusLabel: 'Pending Cash Payment',
        paidAt: '',
        transactionReference: 'Cash Payment Pending',
      },
      status: 'PENDING',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await db.collection('bookings').add(bookingData);
    await sendUserBookingNotification(vehicleData.driverId, {
      title: 'New booking request received',
      body: `${req.user.name || 'A customer'} requested ${vehicleData.make} ${vehicleData.model}.`,
      data: {
        screen: 'BookingDetails',
        bookingId: docRef.id,
        type: 'NEW_BOOKING_REQUEST',
      },
    });
    
    res.status(201).json({
      success: true,
      booking: {
        id: docRef.id,
        ...bookingData,
        vehicle: {
          id: vehicleDoc.id,
          model: vehicleData.model,
          make: vehicleData.make,
          type: vehicleData.type,
          color: vehicleData.color,
          licensePlate: vehicleData.licensePlate,
          capacity: vehicleData.capacity,
          price: vehicleData.price,
          pricePerKm: vehicleData.pricePerKm,
          category: vehicleData.category,
          serviceMode: vehicleData.serviceMode,
          departureTime: vehicleData.departureTime,
          images: vehicleData.images,
        },
      },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get my bookings (as customer)
const getMyBookings = async (req, res) => {
  try {
    const snapshot = await db.collection('bookings')
      .where('customerId', '==', req.user.id)
      .get();
    
    let bookings = [];
    for (const doc of snapshot.docs) {
      const bookingData = doc.data();
      const review = await getBookingReview(doc.id);
      
      // Get vehicle info
      const vehicleDoc = await db.collection('vehicles').doc(bookingData.vehicleId).get();
      
      bookings.push({
        id: doc.id,
        ...bookingData,
        hasReview: Boolean(review),
        review,
        vehicle: vehicleDoc.exists ? {
          id: vehicleDoc.id,
          model: vehicleDoc.data().model,
          make: vehicleDoc.data().make,
          type: vehicleDoc.data().type,
          color: vehicleDoc.data().color,
          licensePlate: vehicleDoc.data().licensePlate,
          capacity: vehicleDoc.data().capacity,
          price: vehicleDoc.data().price,
          pricePerKm: vehicleDoc.data().pricePerKm,
          category: vehicleDoc.data().category,
          serviceMode: vehicleDoc.data().serviceMode,
          departureTime: vehicleDoc.data().departureTime,
          images: vehicleDoc.data().images,
        } : null,
      });
    }

    bookings = bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get driver requests (for drivers)
const getDriverRequests = async (req, res) => {
  try {
    const snapshot = await db.collection('bookings')
      .where('driverId', '==', req.user.id)
      .get();
    
    let bookings = [];
    for (const doc of snapshot.docs) {
      const bookingData = doc.data();
      const review = await getBookingReview(doc.id);
      
      // Get customer info
      const customerDoc = await db.collection('users').doc(bookingData.customerId).get();
      
      // Get vehicle info
      const vehicleDoc = await db.collection('vehicles').doc(bookingData.vehicleId).get();
      
      bookings.push({
        id: doc.id,
        ...bookingData,
        hasReview: Boolean(review),
        review,
        customer: customerDoc.exists ? {
          name: customerDoc.data().name,
          phone: customerDoc.data().phone,
          rating: customerDoc.data().rating,
        } : null,
        vehicle: vehicleDoc.exists ? {
          id: vehicleDoc.id,
          model: vehicleDoc.data().model,
          make: vehicleDoc.data().make,
          type: vehicleDoc.data().type,
          color: vehicleDoc.data().color,
          licensePlate: vehicleDoc.data().licensePlate,
          capacity: vehicleDoc.data().capacity,
          price: vehicleDoc.data().price,
          pricePerKm: vehicleDoc.data().pricePerKm,
          category: vehicleDoc.data().category,
          serviceMode: vehicleDoc.data().serviceMode,
          departureTime: vehicleDoc.data().departureTime,
        } : null,
      });
    }

    bookings = bookings
      .filter((booking) => ['PENDING', 'ACCEPTED', 'REJECTED'].includes(booking.status))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Get driver requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update booking status (Accept/Reject)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }
    
    const bookingDoc = await db.collection('bookings').doc(id).get();
    
    if (!bookingDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    const bookingData = bookingDoc.data();
    const review = await getBookingReview(bookingDoc.id);
    
    // Check authorization
    if (status === 'ACCEPTED' || status === 'REJECTED') {
      if (bookingData.driverId !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only the driver can accept/reject bookings' 
        });
      }
    } else if (status === 'CANCELLED') {
      if (bookingData.customerId !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only the customer can cancel bookings' 
        });
      }
    }
    
    await db.collection('bookings').doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
    });
    await sendUserBookingNotification(bookingData.customerId, {
      title: 'Booking status updated',
      body: `Your booking was ${status.toLowerCase()}.`,
      data: {
        screen: 'BookingDetails',
        bookingId: id,
        status,
        type: 'BOOKING_STATUS_UPDATE',
      },
    });
    
    res.json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get single booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bookingDoc = await db.collection('bookings').doc(id).get();
    
    if (!bookingDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    const bookingData = bookingDoc.data();
    const review = await getBookingReview(bookingDoc.id);
    
    // Check authorization
    if (bookingData.customerId !== req.user.id && bookingData.driverId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    // Get customer info
    const customerDoc = await db.collection('users').doc(bookingData.customerId).get();
    
    // Get driver info
    const driverDoc = await db.collection('users').doc(bookingData.driverId).get();
    
    // Get vehicle info
    const vehicleDoc = await db.collection('vehicles').doc(bookingData.vehicleId).get();
    
    res.json({
      success: true,
      booking: {
        id: bookingDoc.id,
        ...bookingData,
        hasReview: Boolean(review),
        review,
        customer: customerDoc.exists ? {
          name: customerDoc.data().name,
          phone: customerDoc.data().phone,
        } : null,
        driver: driverDoc.exists ? {
          name: driverDoc.data().name,
          phone: driverDoc.data().phone,
        } : null,
        vehicle: vehicleDoc.exists ? {
          id: vehicleDoc.id,
          model: vehicleDoc.data().model,
          make: vehicleDoc.data().make,
          type: vehicleDoc.data().type,
          color: vehicleDoc.data().color,
          licensePlate: vehicleDoc.data().licensePlate,
          capacity: vehicleDoc.data().capacity,
          price: vehicleDoc.data().price,
          pricePerKm: vehicleDoc.data().pricePerKm,
          category: vehicleDoc.data().category,
          serviceMode: vehicleDoc.data().serviceMode,
          departureTime: vehicleDoc.data().departureTime,
          images: vehicleDoc.data().images,
        } : null,
      },
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Add review for completed booking
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    const bookingDoc = await db.collection('bookings').doc(id).get();
    
    if (!bookingDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    const bookingData = bookingDoc.data();
    
    if (bookingData.customerId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the customer can review this booking' 
      });
    }
    
    if (bookingData.status !== 'COMPLETED') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only review completed bookings' 
      });
    }
    
    // Check if review already exists
    const existingReview = await db.collection('reviews')
      .where('bookingId', '==', id)
      .get();
    
    if (!existingReview.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'Review already exists for this booking' 
      });
    }
    
    const reviewData = {
      bookingId: id,
      vehicleId: bookingData.vehicleId,
      userId: req.user.id,
      driverId: bookingData.driverId,
      rating: parseInt(rating),
      comment: comment || '',
      createdAt: new Date().toISOString(),
    };
    
    const reviewRef = await db.collection('reviews').add(reviewData);
    await db.collection('bookings').doc(id).update({
      hasReview: true,
      reviewRating: reviewData.rating,
      reviewComment: reviewData.comment,
      reviewedAt: reviewData.createdAt,
      updatedAt: new Date().toISOString(),
    });
    
    // Update vehicle rating
    const reviewsSnapshot = await db.collection('reviews')
      .where('vehicleId', '==', bookingData.vehicleId)
      .get();
    
    let totalRating = 0;
    reviewsSnapshot.forEach(doc => {
      totalRating += doc.data().rating;
    });
    const averageRating = totalRating / reviewsSnapshot.size;
    
    await db.collection('vehicles').doc(bookingData.vehicleId).update({
      rating: averageRating,
      totalReviews: reviewsSnapshot.size,
    });
    
    // Update driver rating
    const driverReviewsSnapshot = await db.collection('reviews')
      .where('driverId', '==', bookingData.driverId)
      .get();
    
    let driverTotalRating = 0;
    driverReviewsSnapshot.forEach(doc => {
      driverTotalRating += doc.data().rating;
    });
    const driverAverageRating = driverTotalRating / driverReviewsSnapshot.size;
    
    await db.collection('users').doc(bookingData.driverId).update({
      rating: driverAverageRating,
    });
    
    res.status(201).json({
      success: true,
      review: {
        id: reviewRef.id,
        ...reviewData,
      },
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = { 
  createBooking, 
  getMyBookings, 
  getDriverRequests, 
  updateBookingStatus, 
  getBookingById,
  addReview 
};
