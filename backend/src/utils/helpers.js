/**
 * Generate a unique ID (fallback for when Firebase auto-id is not used)
 * @returns {string} - Unique ID
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Format currency to Lesotho Loti (LSL)
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LS', {
    style: 'currency',
    currency: 'LSL',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type (full, date, time)
 * @returns {string} - Formatted date string
 */
const formatDate = (date, format = 'full') => {
  const d = new Date(date);
  
  if (format === 'date') {
    return d.toLocaleDateString('en-LS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('en-LS', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return d.toLocaleString('en-LS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Is valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Lesotho format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Is valid phone number
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^(\+266|0)[5-8][0-9]{7}$/;
  return phoneRegex.test(phone);
};

/**
 * Sanitize object by removing null/undefined values
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
const sanitizeObject = (obj) => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      result[key] = value;
    }
  }
  return result;
};

/**
 * Paginate array results
 * @param {array} data - Array to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {object} - Paginated result
 */
const paginate = (data, page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    data: data.slice(start, end),
    pagination: {
      page,
      limit,
      total: data.length,
      pages: Math.ceil(data.length / limit),
    },
  };
};

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate random OTP code
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - OTP code
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} - Cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if two objects are equal
 * @param {object} obj1 - First object
 * @param {object} obj2 - Second object
 * @returns {boolean} - Are objects equal
 */
const isEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

/**
 * Extract error message from error object
 * @param {Error} error - Error object
 * @returns {string} - Error message
 */
const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Log with timestamp
 * @param {string} level - Log level (info, error, warn, debug)
 * @param {string} message - Log message
 * @param {object} data - Additional data to log
 */
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data }),
  };
  
  switch (level) {
    case 'error':
      console.error(JSON.stringify(logEntry));
      break;
    case 'warn':
      console.warn(JSON.stringify(logEntry));
      break;
    default:
      console.log(JSON.stringify(logEntry));
  }
};

module.exports = {
  generateId,
  calculateDistance,
  formatCurrency,
  formatDate,
  isValidEmail,
  isValidPhone,
  sanitizeObject,
  paginate,
  sleep,
  generateOTP,
  deepClone,
  isEqual,
  getErrorMessage,
  log,
};
