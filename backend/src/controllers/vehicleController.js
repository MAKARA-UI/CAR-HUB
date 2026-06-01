const crypto = require('crypto');
const { db, getStorageBucketCandidates } = require('../config/firebase');

// Get all vehicles with filters
const getVehicles = async (req, res) => {
  try {
    const { type, minPrice, maxPrice, search } = req.query;
    
    let query = db.collection('vehicles').where('isAvailable', '==', true);
    
    // Apply filters
    if (type && type !== 'all') {
      query = query.where('type', '==', type);
    }
    
    if (minPrice) {
      query = query.where('price', '>=', parseFloat(minPrice));
    }
    
    if (maxPrice) {
      query = query.where('price', '<=', parseFloat(maxPrice));
    }
    
    const snapshot = await query.get();
    
    let vehicles = [];
    for (const doc of snapshot.docs) {
      const vehicleData = doc.data();
      
      // Get driver info
      const driverDoc = await db.collection('users').doc(vehicleData.driverId).get();
      const driverData = driverDoc.exists ? driverDoc.data() : null;
      
      vehicles.push({
        id: doc.id,
        ...vehicleData,
        driver: driverData ? {
          name: driverData.name,
          rating: driverData.rating,
          totalTrips: driverData.totalTrips,
        } : null,
      });
    }
    
    // Apply search filter client-side
    if (search) {
      vehicles = vehicles.filter(vehicle => 
        vehicle.model.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get single vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vehicleDoc = await db.collection('vehicles').doc(id).get();
    
    if (!vehicleDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vehicle not found' 
      });
    }
    
    const vehicleData = vehicleDoc.data();
    
    // Get driver info
    const driverDoc = await db.collection('users').doc(vehicleData.driverId).get();
    const driverData = driverDoc.exists ? driverDoc.data() : null;
    
    // Get reviews for this vehicle
    const reviewsSnapshot = await db.collection('reviews')
      .where('vehicleId', '==', id)
      .get();
    
    const reviews = [];
    for (const reviewDoc of reviewsSnapshot.docs) {
      const reviewData = reviewDoc.data();
      const userDoc = await db.collection('users').doc(reviewData.userId).get();
      
      reviews.push({
        id: reviewDoc.id,
        ...reviewData,
        user: userDoc.exists ? {
          name: userDoc.data().name,
          avatar: userDoc.data().avatar,
        } : null,
      });
    }
    
    res.json({
      success: true,
      vehicle: {
        id: vehicleDoc.id,
        ...vehicleData,
        driver: driverData ? {
          name: driverData.name,
          phone: driverData.phone,
          rating: driverData.rating,
          totalTrips: driverData.totalTrips,
        } : null,
      },
      reviews,
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Create vehicle (Driver only)
const createVehicle = async (req, res) => {
  try {
    const {
      type,
      make,
      model,
      year,
      price,
      pricePerKm,
      capacity,
      color,
      licensePlate,
      category,
      serviceMode,
      departureTime,
      images,
    } = req.body;
    const driverPrice = parseFloat(price ?? pricePerKm);
    
    const vehicleData = {
      driverId: req.user.id,
      type,
      make,
      model,
      year: parseInt(year),
      price: driverPrice,
      pricePerKm: driverPrice,
      capacity: parseInt(capacity),
      color: color || '',
      licensePlate: licensePlate || '',
      category: category || 'local',
      serviceMode: serviceMode || 'individual',
      departureTime: departureTime || '',
      images: images || [],
      rating: 0,
      totalReviews: 0,
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await db.collection('vehicles').add(vehicleData);
    
    res.status(201).json({
      success: true,
      vehicle: {
        id: docRef.id,
        ...vehicleData,
      },
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const uploadVehicleImage = async (req, res) => {
  try {
    const { base64, fileName, contentType } = req.body;

    if (!base64) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required',
      });
    }

    const imageBase64 = base64.includes(',') ? base64.split(',').pop() : base64;
    const safeFileName = (fileName || 'vehicle.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
    const token = crypto.randomUUID();
    const filePath = `vehicles/${req.user.id}/${Date.now()}_${safeFileName}`;
    const buffer = Buffer.from(imageBase64, 'base64');
    const buckets = getStorageBucketCandidates();
    let uploadedBucket = null;
    let lastError = null;

    for (const storageBucket of buckets) {
      try {
        const file = storageBucket.file(filePath);
        await file.save(buffer, {
          resumable: false,
          metadata: {
            contentType: contentType || 'image/jpeg',
            metadata: {
              firebaseStorageDownloadTokens: token,
            },
          },
        });
        uploadedBucket = storageBucket;
        break;
      } catch (error) {
        lastError = error;
        if (error.code !== 404) {
          throw error;
        }
      }
    }

    if (!uploadedBucket) {
      const attemptedBuckets = buckets.map((bucket) => bucket.name).join(', ');
      throw new Error(
        `No Firebase Storage bucket is available. Attempted buckets: ${attemptedBuckets}`
      );
    }

    const encodedPath = encodeURIComponent(filePath);
    const url = `https://firebasestorage.googleapis.com/v0/b/${uploadedBucket.name}/o/${encodedPath}?alt=media&token=${token}`;

    res.status(201).json({
      success: true,
      url,
      path: filePath,
    });
  } catch (error) {
    console.error('Upload vehicle image error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update vehicle
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const vehicleDoc = await db.collection('vehicles').doc(id).get();
    
    if (!vehicleDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vehicle not found' 
      });
    }
    
    const vehicleData = vehicleDoc.data();
    
    if (vehicleData.driverId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only update your own vehicles' 
      });
    }
    
    updates.updatedAt = new Date().toISOString();
    await db.collection('vehicles').doc(id).update(updates);
    
    res.json({
      success: true,
      message: 'Vehicle updated successfully',
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vehicleDoc = await db.collection('vehicles').doc(id).get();
    
    if (!vehicleDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vehicle not found' 
      });
    }
    
    const vehicleData = vehicleDoc.data();
    
    if (vehicleData.driverId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only delete your own vehicles' 
      });
    }
    
    await db.collection('vehicles').doc(id).delete();
    
    res.json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = { getVehicles, getVehicleById, createVehicle, uploadVehicleImage, updateVehicle, deleteVehicle };
