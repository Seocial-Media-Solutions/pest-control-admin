import api from './api';

/**
 * Booking Service
 * Handles all booking-related API calls
 */

const bookingService = {
    /**
     * Get all bookings with optional filters
     * @param {Object} params - Query parameters
     * @returns {Promise} Bookings data
     */
    getAllBookings: async (params = {}) => {
        try {
            const response = await api.get('/bookings', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    },

    /**
     * Get booking by ID
     * @param {string} id - Booking ID
     * @returns {Promise} Booking data
     */
    getBookingById: async (id) => {
        try {
            const response = await api.get(`/bookings/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching booking:', error);
            throw error;
        }
    },

    /**
     * Create new booking
     * @param {Object} bookingData - Booking data
     * @returns {Promise} Created booking
     */
    createBooking: async (bookingData) => {
        try {
            const response = await api.post('/bookings', bookingData);
            return response.data;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    },

    /**
     * Update booking
     * @param {string} id - Booking ID
     * @param {Object} bookingData - Updated booking data
     * @returns {Promise} Updated booking
     */
    updateBooking: async (id, bookingData) => {
        try {
            const response = await api.put(`/bookings/${id}`, bookingData);
            return response.data;
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    },

    /**
     * Delete booking
     * @param {string} id - Booking ID
     * @returns {Promise} Deleted booking
     */
    deleteBooking: async (id) => {
        try {
            const response = await api.delete(`/bookings/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
    },
};

export default bookingService;
