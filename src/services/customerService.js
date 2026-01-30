import api from './api';

/**
 * Customer Service
 * Handles all customer-related API calls
 */

const customerService = {
    /**
     * Get all customers with optional filters
     * @param {Object} params - Query parameters
     * @returns {Promise} Customers data
     */
    getAllCustomers: async (params = {}) => {
        try {
            const response = await api.get('/customers', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    },

    /**
     * Get customer by ID
     * @param {string} id - Customer ID
     * @returns {Promise} Customer data
     */
    getCustomerById: async (id) => {
        try {
            const response = await api.get(`/customers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching customer:', error);
            throw error;
        }
    },

    /**
     * Create new customer
     * @param {Object} customerData - Customer data
     * @returns {Promise} Created customer
     */
    createCustomer: async (customerData) => {
        try {
            const response = await api.post('/customers', customerData);
            return response.data;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    },

    /**
     * Update customer
     * @param {string} id - Customer ID
     * @param {Object} customerData - Updated customer data
     * @returns {Promise} Updated customer
     */
    updateCustomer: async (id, customerData) => {
        try {
            const response = await api.put(`/customers/${id}`, customerData);
            return response.data;
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    },

    /**
     * Delete customer
     * @param {string} id - Customer ID
     * @returns {Promise} Deleted customer
     */
    deleteCustomer: async (id) => {
        try {
            const response = await api.delete(`/customers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    },

    /**
     * Toggle customer active status
     * @param {string} id - Customer ID
     * @returns {Promise} Updated customer
     */
    toggleCustomerStatus: async (id) => {
        try {
            const response = await api.patch(`/customers/${id}/toggle-status`);
            return response.data;
        } catch (error) {
            console.error('Error toggling customer status:', error);
            throw error;
        }
    },

    /**
     * Get customer statistics
     * @returns {Promise} Customer stats
     */
    getCustomerStats: async () => {
        try {
            const response = await api.get('/customers/stats/overview');
            return response.data;
        } catch (error) {
            console.error('Error fetching customer stats:', error);
            throw error;
        }
    },
};

export default customerService;
