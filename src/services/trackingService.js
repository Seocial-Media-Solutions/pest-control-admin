import api from './api';

// Get all tracking records
export const getAllTracking = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.technicianId) params.append('technicianId', filters.technicianId);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = queryString ? `/tracking?${queryString}` : '/tracking';

    const response = await api.get(url);
    return response.data;
};

// Get tracking record by ID
export const getTrackingById = async (id) => {
    const response = await api.get(`/tracking/${id}`);
    return response.data;
};

// Get latest tracking for a technician
export const getLatestTrackingByTechnician = async (technicianId) => {
    const response = await api.get(`/tracking/technician/${technicianId}/latest`);
    return response.data;
};

// Create a new tracking record
export const createTracking = async (trackingData) => {
    const response = await api.post('/tracking', trackingData);
    return response.data;
};

// Update tracking record
export const updateTracking = async (id, trackingData) => {
    const response = await api.put(`/tracking/${id}`, trackingData);
    return response.data;
};

// Delete tracking record
export const deleteTracking = async (id) => {
    const response = await api.delete(`/tracking/${id}`);
    return response.data;
};

// Get nearby tracking records
export const getNearbyTracking = async (longitude, latitude, radius = 5000) => {
    const response = await api.get(`/tracking/nearby?longitude=${longitude}&latitude=${latitude}&radius=${radius}`);
    return response.data;
};
