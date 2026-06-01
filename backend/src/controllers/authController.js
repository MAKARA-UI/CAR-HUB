const { db, auth } = require('../config/firebase');

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;
    
    // Check if user already exists in Firestore
    const existingUserQuery = await db.collection('users')
      .where('email', '==', email)
      .get();
    
    if (!existingUserQuery.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });
    
    // Create custom token for the user
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    // Save user to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      phone: phone || '',
      role,
      avatar: '',
      rating: 0,
      totalTrips: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        uid: userRecord.uid,
        email,
        name,
        role,
      },
      token: customToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Get user from Firestore
    const userQuery = await db.collection('users')
      .where('email', '==', email)
      .get();
    
    if (userQuery.empty) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    
    // Get user from Firebase Auth
    const userRecord = await auth.getUserByEmail(email);
    
    // Create custom token
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    res.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        avatar: userData.avatar,
        rating: userData.rating,
      },
      token: customToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.id).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user: {
        uid: req.user.id,
        ...userDoc.data(),
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = { register, login, getMe };