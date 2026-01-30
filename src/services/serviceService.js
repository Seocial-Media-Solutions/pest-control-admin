import api from './api';

// Get all services
export const getAllServices = async () => {
    const response = await api.get('/services');
    return response.data;
};

// Get service by ID
export const getServiceById = async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
};

// Get service by title
export const getServiceByTitle = async (title) => {
    const response = await api.get(`/services/title/${title}`);
    return response.data;
};

// Create new service
export const createService = async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
};

// Update service
export const updateService = async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
};

// Delete service
export const deleteService = async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
};

// Add sub-service
export const addSubService = async (serviceId, subServiceData) => {
    const response = await api.post(`/services/${serviceId}/sub-service`, subServiceData);
    return response.data;
};

// Update sub-service
export const updateSubService = async (serviceId, subServiceId, subServiceData) => {
    const response = await api.put(`/services/${serviceId}/sub-service/${subServiceId}`, subServiceData);
    return response.data;
};

// Delete sub-service
export const deleteSubService = async (serviceId, subServiceId) => {
    const response = await api.delete(`/services/${serviceId}/sub-service/${subServiceId}`);
    return response.data;
};

// Get all sub-services (flat list)
export const getAllSubServices = async (params = {}) => {
    const response = await api.get('/sub-services', { params });
    return response.data;
};

// Default export
const serviceService = {
    getAllServices,
    getServiceById,
    getServiceByTitle,
    createService,
    updateService,
    deleteService,
    addSubService,
    updateSubService,
    deleteSubService,
    getAllSubServices
};

export default serviceService;
