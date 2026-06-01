const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  next();
};

const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').isIn(['customer', 'driver']),
  validate
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate
];

const validateBooking = [
  body('vehicleId').notEmpty(),
  body('pickupLocation').notEmpty(),
  body('destination').notEmpty(),
  body('date').isISO8601(),
  body('price').isNumeric(),
  validate
];

module.exports = { validateRegister, validateLogin, validateBooking };