import api from './api';

/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */

const dashboardService = {
    /**
     * Get comprehensive dashboard statistics
     * @returns {Promise} Dashboard stats data
     */
    getStats: async () => {
        try {
            const response = await api.get('/dashboard/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    /**
     * Get assignment trends over time
     * @param {string} period - Time period (day, week, month, year)
     * @returns {Promise} Trends data
     */
    getTrends: async (period = 'month') => {
        try {
            const response = await api.get(`/dashboard/trends?period=${period}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching trends:', error);
            throw error;
        }
    },

    /**
     * Get technician activity and location data
     * @returns {Promise} Technician activity data
     */
    getTechnicianActivity: async () => {
        try {
            const response = await api.get('/dashboard/technician-activity');
            return response.data;
        } catch (error) {
            console.error('Error fetching technician activity:', error);
            throw error;
        }
    },

    /**
     * Get revenue analytics
     * @returns {Promise} Revenue analytics data
     */
    getRevenueAnalytics: async () => {
        try {
            const response = await api.get('/dashboard/revenue-analytics');
            return response.data;
        } catch (error) {
            console.error('Error fetching revenue analytics:', error);
            throw error;
        }
    },

    /**
     * Get all dashboard data in one call
     * @returns {Promise} All dashboard data
     */
    getAllData: async () => {
        try {
            const response = await api.get('/dashboard/all');
            return response.data;
        } catch (error) {
            console.error('Error fetching all dashboard data:', error);
            throw error;
        }
    },
};

export default dashboardService;
