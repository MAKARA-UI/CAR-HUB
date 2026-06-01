export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LS', {
    style: 'currency',
    currency: 'LSL',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (date, format = 'full') => {
  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return '';

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

export const calculatePrice = (price) => Number(price || 0);

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getRatingStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  return { fullStars, hasHalfStar, emptyStars };
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePhone = (phone) => /^(\+266|0)[5-8][0-9]{7}$/.test(phone);

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
