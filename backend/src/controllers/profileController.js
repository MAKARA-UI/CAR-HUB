const { db } = require('../config/firebase');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const userData = userDoc.data();
    
    // Get stats based on role
    let stats = {};
    
    if (userData.role === 'driver') {
      const vehiclesSnapshot = await db.collection('vehicles')
        .where('driverId', '==', req.user.id)
        .get();
      
      const bookingsSnapshot = await db.collection('bookings')
        .where('driverId', '==', req.user.id)
        .get();
      
      stats = {
        totalVehicles: vehiclesSnapshot.size,
        totalTrips: bookingsSnapshot.size,
      };
    } else {
      const bookingsSnapshot = await db.collection('bookings')
        .where('customerId', '==', req.user.id)
        .get();
      
      stats = {
        totalTrips: bookingsSnapshot.size,
      };
    }
    
    res.json({
      success: true,
      profile: {
        ...userData,
        stats,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (avatar) updates.avatar = avatar;
    updates.updatedAt = new Date().toISOString();
    
    await db.collection('users').doc(req.user.id).update(updates);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Save Expo push token for real booking notifications
const updatePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;

    if (!pushToken || typeof pushToken !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Push token is required',
      });
    }

    await db.collection('users').doc(req.user.id).update({
      pushToken,
      pushTokenUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Push token updated successfully',
    });
  } catch (error) {
    console.error('Update push token error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get driver's vehicles
const getMyVehicles = async (req, res) => {
  try {
    const snapshot = await db.collection('vehicles')
      .where('driverId', '==', req.user.id)
      .get();
    
    const vehicles = [];
    snapshot.forEach(doc => {
      vehicles.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    res.json({
      success: true,
      vehicles,
    });
  } catch (error) {
    console.error('Get my vehicles error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = { getProfile, updateProfile, updatePushToken, getMyVehicles };
