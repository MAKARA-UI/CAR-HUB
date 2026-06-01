import { CATEGORY_MODE_REQUIRED } from './constants';

export const validateLogin = (email, password) => {
  const errors = {};

  if (!email) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';

  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateRegister = (name, email, phone, password, confirmPassword, role) => {
  const errors = {};

  if (!name) errors.name = 'Name is required';
  else if (name.length < 2) errors.name = 'Name must be at least 2 characters';

  if (!email) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';

  if (!phone) errors.phone = 'Phone number is required';
  else if (!/^(\+266|0)[5-8][0-9]{7}$/.test(phone)) errors.phone = 'Invalid Lesotho phone number';

  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!role) errors.role = 'Please select a role';

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateBooking = (pickup, destination, date) => {
  const errors = {};

  if (!pickup) errors.pickup = 'Pickup location is required';
  if (!destination) errors.destination = 'Destination is required';
  if (!date) errors.date = 'Date is required';
  else if (new Date(date) < new Date()) errors.date = 'Date cannot be in the past';

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateVehicle = (
  type,
  make,
  model,
  year,
  price,
  capacity,
  color,
  licensePlate,
  category,
  serviceMode,
  departureTime
) => {
  const errors = {};
  const parsedYear = Number(year);
  const parsedPrice = Number(price);
  const parsedCapacity = Number(capacity);

  if (!type || type === 'all') errors.type = 'Vehicle type is required';
  if (!make) errors.make = 'Make is required';
  if (!model) errors.model = 'Model is required';
  if (!year) errors.year = 'Year is required';
  else if (parsedYear < 1990 || parsedYear > new Date().getFullYear()) errors.year = 'Year must be between 1990 and current year';
  if (!price) errors.price = 'Price is required';
  else if (parsedPrice <= 0) errors.price = 'Price must be greater than 0';
  if (!capacity) errors.capacity = 'Capacity is required';
  else if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) errors.capacity = 'Capacity must be at least 1 seat';
  if (!color) errors.color = 'Color is required';
  if (!licensePlate) errors.licensePlate = 'License plate is required';
  if (!category) errors.category = 'Category is required';
  if (CATEGORY_MODE_REQUIRED.includes(category) && !serviceMode) errors.serviceMode = 'Choose Private Hire or Shared Trip';
  if (category === 'outside_country' && serviceMode === 'trip' && !departureTime) {
    errors.departureTime = 'Departure time is required';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};
