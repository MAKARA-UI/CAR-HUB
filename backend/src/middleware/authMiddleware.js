const { admin, db } = require('../config/firebase');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token' 
      });
    }
    
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Get user from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    req.user = {
      id: userId,
      ...userDoc.data()
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized, invalid token' 
    });
  }
};

const isDriver = (req, res, next) => {
  if (req.user.role !== 'driver') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Driver only.' 
    });
  }
  next();
};

const isCustomer = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Customer only.' 
    });
  }
  next();
};

module.exports = { protect, isDriver, isCustomer };