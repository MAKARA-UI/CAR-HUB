import { create } from 'zustand';
import { bookingAPI } from '../services/api';
import { listenToCollection } from '../services/firebase';

export const bookingStore = create((set, get) => ({
  bookings: [],
  driverRequests: [],
  currentBooking: null,
  isLoading: false,
  error: null,
  unsubscribeBookings: null,
  unsubscribeRequests: null,

  fetchMyBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.getMyBookings();
      if (response.success) set({ bookings: response.bookings, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchDriverRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.getDriverRequests();
      if (response.success) set({ driverRequests: response.bookings, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.create(bookingData);
      if (response.success) {
        set({ isLoading: false });
        return { success: true, booking: response.booking };
      }
      set({ isLoading: false });
      return { success: false, error: 'Booking failed' };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateBookingStatus: async (bookingId, status, reviewData = null) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.updateStatus(bookingId, status, reviewData);
      if (response.success) {
        await get().fetchMyBookings();
        await get().fetchDriverRequests();
        set({ isLoading: false });
        return { success: true };
      }
      set({ isLoading: false });
      return { success: false, error: 'Status update failed' };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  getBookingById: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.getById(bookingId);
      if (response.success) set({ currentBooking: response.booking, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  subscribeToBookings: (userId, role) => {
    const { unsubscribeBookings, unsubscribeRequests } = get();
    if (unsubscribeBookings) unsubscribeBookings();
    if (unsubscribeRequests) unsubscribeRequests();

    const field = role === 'driver' ? 'driverId' : 'customerId';
    const unsubscribe = listenToCollection(
      'bookings',
      (bookings) => {
        if (role === 'driver') set({ driverRequests: bookings });
        else set({ bookings });
      },
      [{ field, operator: '==', value: userId }],
      'createdAt'
    );

    if (role === 'driver') set({ unsubscribeRequests: unsubscribe });
    else set({ unsubscribeBookings: unsubscribe });
  },

  clearSubscriptions: () => {
    const { unsubscribeBookings, unsubscribeRequests } = get();
    if (unsubscribeBookings) unsubscribeBookings();
    if (unsubscribeRequests) unsubscribeRequests();
    set({ unsubscribeBookings: null, unsubscribeRequests: null });
  },

  clearCurrentBooking: () => set({ currentBooking: null }),
}));
