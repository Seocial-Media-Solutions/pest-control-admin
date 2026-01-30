import api from './api';

// Get health status
export const getHealthStatus = async () => {
    const response = await api.get('/health');
    return response.data;
};

// Get detailed health status
export const getDetailedHealthStatus = async () => {
    const response = await api.get('/health/detailed');
    return response.data;
};
