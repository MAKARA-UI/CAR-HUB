const { db, admin } = require('../config/firebase');

class FirebaseService {
  // ==================== USER OPERATIONS ====================
  
  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} - User data
   */
  static async getUserById(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return null;
      }
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }
  
  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<object>} - User data
   */
  static async getUserByEmail(email) {
    try {
      const query = await db.collection('users').where('email', '==', email).get();
      if (query.empty) {
        return null;
      }
      const doc = query.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Get user by email error:', error);
      throw error;
    }
  }
  
  /**
   * Create new user
   * @param {object} userData - User data
   * @returns {Promise<object>} - Created user
   */
  static async createUser(userData) {
    try {
      const userRef = db.collection('users').doc(userData.uid);
      await userRef.set({
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: userData.uid, ...userData };
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }
  
  /**
   * Update user
   * @param {string} userId - User ID
   * @param {object} updates - Updates to apply
   * @returns {Promise<boolean>} - Success status
   */
  static async updateUser(userId, updates) {
    try {
      updates.updatedAt = new Date().toISOString();
      await db.collection('users').doc(userId).update(updates);
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }
  
  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteUser(userId) {
    try {
      await db.collection('users').doc(userId).delete();
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }
  
  // ==================== VEHICLE OPERATIONS ====================
  
  /**
   * Get all vehicles with optional filters
   * @param {object} filters - Filter criteria
   * @returns {Promise<array>} - List of vehicles
   */
  static async getVehicles(filters = {}) {
    try {
      let query = db.collection('vehicles').where('isAvailable', '==', true);
      
      if (filters.type && filters.type !== 'all') {
        query = query.where('type', '==', filters.type);
      }
      
      if (filters.minPrice) {
        query = query.where('price', '>=', parseFloat(filters.minPrice));
      }
      
      if (filters.maxPrice) {
        query = query.where('price', '<=', parseFloat(filters.maxPrice));
      }
      
      const snapshot = await query.get();
      const vehicles = [];
      
      for (const doc of snapshot.docs) {
        const vehicleData = doc.data();
        const driver = await this.getUserById(vehicleData.driverId);
        
        vehicles.push({
          id: doc.id,
          ...vehicleData,
          driver: driver ? {
            name: driver.name,
            rating: driver.rating,
            phone: driver.phone,
          } : null,
        });
      }
      
      return vehicles;
    } catch (error) {
      console.error('Get vehicles error:', error);
      throw error;
    }
  }
  
  /**
   * Get vehicle by ID
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise<object>} - Vehicle data
   */
  static async getVehicleById(vehicleId) {
    try {
      const vehicleDoc = await db.collection('vehicles').doc(vehicleId).get();
      if (!vehicleDoc.exists) {
        return null;
      }
      
      const vehicleData = vehicleDoc.data();
      const driver = await this.getUserById(vehicleData.driverId);
      const reviews = await this.getVehicleReviews(vehicleId);
      
      return {
        id: vehicleDoc.id,
        ...vehicleData,
        driver: driver ? {
          name: driver.name,
          rating: driver.rating,
          phone: driver.phone,
          avatar: driver.avatar,
        } : null,
        reviews,
      };
    } catch (error) {
      console.error('Get vehicle by ID error:', error);
      throw error;
    }
  }
  
  /**
   * Create vehicle
   * @param {object} vehicleData - Vehicle data
   * @returns {Promise<object>} - Created vehicle
   */
  static async createVehicle(vehicleData) {
    try {
      const vehicleRef = db.collection('vehicles').doc();
      await vehicleRef.set({
        ...vehicleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: vehicleRef.id, ...vehicleData };
    } catch (error) {
      console.error('Create vehicle error:', error);
      throw error;
    }
  }
  
  /**
   * Update vehicle
   * @param {string} vehicleId - Vehicle ID
   * @param {object} updates - Updates to apply
   * @returns {Promise<boolean>} - Success status
   */
  static async updateVehicle(vehicleId, updates) {
    try {
      updates.updatedAt = new Date().toISOString();
      await db.collection('vehicles').doc(vehicleId).update(updates);
      return true;
    } catch (error) {
      console.error('Update vehicle error:', error);
      throw error;
    }
  }
  
  /**
   * Delete vehicle
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteVehicle(vehicleId) {
    try {
      await db.collection('vehicles').doc(vehicleId).delete();
      return true;
    } catch (error) {
      console.error('Delete vehicle error:', error);
      throw error;
    }
  }
  
  /**
   * Get vehicles by driver
   * @param {string} driverId - Driver ID
   * @returns {Promise<array>} - List of vehicles
   */
  static async getVehiclesByDriver(driverId) {
    try {
      const snapshot = await db.collection('vehicles')
        .where('driverId', '==', driverId)
        .get();
      
      const vehicles = [];
      snapshot.forEach(doc => {
        vehicles.push({ id: doc.id, ...doc.data() });
      });
      
      return vehicles;
    } catch (error) {
      console.error('Get vehicles by driver error:', error);
      throw error;
    }
  }
  
  // ==================== BOOKING OPERATIONS ====================
  
  /**
   * Create booking
   * @param {object} bookingData - Booking data
   * @returns {Promise<object>} - Created booking
   */
  static async createBooking(bookingData) {
    try {
      const bookingRef = db.collection('bookings').doc();
      await bookingRef.set({
        ...bookingData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: bookingRef.id, ...bookingData };
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  }
  
  /**
   * Get booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<object>} - Booking data
   */
  static async getBookingById(bookingId) {
    try {
      const bookingDoc = await db.collection('bookings').doc(bookingId).get();
      if (!bookingDoc.exists) {
        return null;
      }
      
      const bookingData = bookingDoc.data();
      const customer = await this.getUserById(bookingData.customerId);
      const driver = await this.getUserById(bookingData.driverId);
      const vehicle = await this.getVehicleById(bookingData.vehicleId);
      
      return {
        id: bookingDoc.id,
        ...bookingData,
        customer: customer ? {
          name: customer.name,
          phone: customer.phone,
          avatar: customer.avatar,
        } : null,
        driver: driver ? {
          name: driver.name,
          phone: driver.phone,
          avatar: driver.avatar,
        } : null,
        vehicle: vehicle ? {
          model: vehicle.model,
          make: vehicle.make,
          images: vehicle.images,
        } : null,
      };
    } catch (error) {
      console.error('Get booking by ID error:', error);
      throw error;
    }
  }
  
  /**
   * Get bookings by user (customer or driver)
   * @param {string} userId - User ID
   * @param {string} role - User role (customer or driver)
   * @returns {Promise<array>} - List of bookings
   */
  static async getBookingsByUser(userId, role) {
    try {
      const field = role === 'driver' ? 'driverId' : 'customerId';
      const snapshot = await db.collection('bookings')
        .where(field, '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const bookings = [];
      for (const doc of snapshot.docs) {
        const bookingData = doc.data();
        const vehicle = await this.getVehicleById(bookingData.vehicleId);
        
        bookings.push({
          id: doc.id,
          ...bookingData,
          vehicle: vehicle ? {
            model: vehicle.model,
            make: vehicle.make,
            images: vehicle.images,
          } : null,
        });
      }
      
      return bookings;
    } catch (error) {
      console.error('Get bookings by user error:', error);
      throw error;
    }
  }
  
  /**
   * Get pending bookings for driver
   * @param {string} driverId - Driver ID
   * @returns {Promise<array>} - List of pending bookings
   */
  static async getPendingBookings(driverId) {
    try {
      const snapshot = await db.collection('bookings')
        .where('driverId', '==', driverId)
        .where('status', '==', 'PENDING')
        .orderBy('createdAt', 'asc')
        .get();
      
      const bookings = [];
      for (const doc of snapshot.docs) {
        const bookingData = doc.data();
        const customer = await this.getUserById(bookingData.customerId);
        
        bookings.push({
          id: doc.id,
          ...bookingData,
          customer: customer ? {
            name: customer.name,
            phone: customer.phone,
            rating: customer.rating,
          } : null,
        });
      }
      
      return bookings;
    } catch (error) {
      console.error('Get pending bookings error:', error);
      throw error;
    }
  }
  
  /**
   * Update booking status
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status
   * @returns {Promise<boolean>} - Success status
   */
  static async updateBookingStatus(bookingId, status) {
    try {
      await db.collection('bookings').doc(bookingId).update({
        status,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Update booking status error:', error);
      throw error;
    }
  }
  
  /**
   * Get booking count by status
   * @param {string} driverId - Driver ID
   * @returns {Promise<object>} - Counts by status
   */
  static async getBookingStats(driverId) {
    try {
      const snapshot = await db.collection('bookings')
        .where('driverId', '==', driverId)
        .get();
      
      const stats = {
        pending: 0,
        accepted: 0,
        completed: 0,
        rejected: 0,
        cancelled: 0,
      };
      
      snapshot.forEach(doc => {
        const status = doc.data().status;
        if (stats[status.toLowerCase()] !== undefined) {
          stats[status.toLowerCase()]++;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Get booking stats error:', error);
      throw error;
    }
  }
  
  // ==================== REVIEW OPERATIONS ====================
  
  /**
   * Add review
   * @param {object} reviewData - Review data
   * @returns {Promise<object>} - Created review
   */
  static async addReview(reviewData) {
    try {
      const reviewRef = db.collection('reviews').doc();
      await reviewRef.set({
        ...reviewData,
        createdAt: new Date().toISOString(),
      });
      return { id: reviewRef.id, ...reviewData };
    } catch (error) {
      console.error('Add review error:', error);
      throw error;
    }
  }
  
  /**
   * Get reviews for a vehicle
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise<array>} - List of reviews
   */
  static async getVehicleReviews(vehicleId) {
    try {
      const snapshot = await db.collection('reviews')
        .where('vehicleId', '==', vehicleId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const reviews = [];
      for (const doc of snapshot.docs) {
        const reviewData = doc.data();
        const user = await this.getUserById(reviewData.userId);
        
        reviews.push({
          id: doc.id,
          ...reviewData,
          user: user ? {
            name: user.name,
            avatar: user.avatar,
          } : null,
        });
      }
      
      return reviews;
    } catch (error) {
      console.error('Get vehicle reviews error:', error);
      throw error;
    }
  }
  
  /**
   * Get average rating for vehicle
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise<number>} - Average rating
   */
  static async getVehicleAverageRating(vehicleId) {
    try {
      const snapshot = await db.collection('reviews')
        .where('vehicleId', '==', vehicleId)
        .get();
      
      if (snapshot.empty) {
        return 0;
      }
      
      let total = 0;
      snapshot.forEach(doc => {
        total += doc.data().rating;
      });
      
      return total / snapshot.size;
    } catch (error) {
      console.error('Get vehicle average rating error:', error);
      throw error;
    }
  }
  
  // ==================== NOTIFICATION OPERATIONS ====================
  
  /**
   * Create notification
   * @param {object} notificationData - Notification data
   * @returns {Promise<object>} - Created notification
   */
  static async createNotification(notificationData) {
    try {
      const notificationRef = db.collection('notifications').doc();
      await notificationRef.set({
        ...notificationData,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      return { id: notificationRef.id, ...notificationData };
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }
  
  /**
   * Get user notifications
   * @param {string} userId - User ID
   * @returns {Promise<array>} - List of notifications
   */
  static async getUserNotifications(userId) {
    try {
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
      
      const notifications = [];
      snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      
      return notifications;
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw error;
    }
  }
  
  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<boolean>} - Success status
   */
  static async markNotificationAsRead(notificationId) {
    try {
      await db.collection('notifications').doc(notificationId).update({
        isRead: true,
      });
      return true;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }
  
  /**
   * Mark all notifications as read for user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  static async markAllNotificationsAsRead(userId) {
    try {
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('isRead', '==', false)
        .get();
      
      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  }
  
  // ==================== REAL-TIME LISTENERS ====================
  
  /**
   * Subscribe to real-time booking updates
   * @param {string} bookingId - Booking ID
   * @param {function} callback - Callback function
   * @returns {function} - Unsubscribe function
   */
  static subscribeToBooking(bookingId, callback) {
    return db.collection('bookings').doc(bookingId).onSnapshot(
      (doc) => {
        if (doc.exists) {
          callback({ id: doc.id, ...doc.data() });
        }
      },
      (error) => {
        console.error('Booking subscription error:', error);
      }
    );
  }
  
  /**
   * Subscribe to driver's pending bookings
   * @param {string} driverId - Driver ID
   * @param {function} callback - Callback function
   * @returns {function} - Unsubscribe function
   */
  static subscribeToDriverBookings(driverId, callback) {
    return db.collection('bookings')
      .where('driverId', '==', driverId)
      .where('status', '==', 'PENDING')
      .onSnapshot(
        (snapshot) => {
          const bookings = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              bookings.push({ id: change.doc.id, ...change.doc.data() });
            }
          });
          callback(bookings);
        },
        (error) => {
          console.error('Driver bookings subscription error:', error);
        }
      );
  }
  
  /**
   * Subscribe to user notifications
   * @param {string} userId - User ID
   * @param {function} callback - Callback function
   * @returns {function} - Unsubscribe function
   */
  static subscribeToNotifications(userId, callback) {
    return db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .onSnapshot(
        (snapshot) => {
          const notifications = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              notifications.push({ id: change.doc.id, ...change.doc.data() });
            }
          });
          if (notifications.length > 0) {
            callback(notifications);
          }
        },
        (error) => {
          console.error('Notifications subscription error:', error);
        }
      );
  }
  
  // ==================== BATCH OPERATIONS ====================
  
  /**
   * Run batch write operation
   * @param {array} operations - Array of operations {type, ref, data}
   * @returns {Promise<boolean>} - Success status
   */
  static async batchWrite(operations) {
    try {
      const batch = db.batch();
      
      operations.forEach(op => {
        switch (op.type) {
          case 'set':
            batch.set(op.ref, op.data);
            break;
          case 'update':
            batch.update(op.ref, op.data);
            break;
          case 'delete':
            batch.delete(op.ref);
            break;
        }
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Batch write error:', error);
      throw error;
    }
  }
  
  // ==================== TRANSACTION OPERATIONS ====================
  
  /**
   * Run transaction operation
   * @param {function} transactionCallback - Transaction callback
   * @returns {Promise<any>} - Transaction result
   */
  static async runTransaction(transactionCallback) {
    try {
      const result = await db.runTransaction(transactionCallback);
      return result;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }
}

module.exports = FirebaseService;
