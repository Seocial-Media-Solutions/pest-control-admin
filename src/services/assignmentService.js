import api from './api';

// ============================================
// Basic Assignment Operations
// ============================================

// Get all assignments
export const getAllAssignments = async () => {
    const response = await api.get('/assignments');
    return response.data;
};

// Get assignment by ID
export const getAssignmentById = async (id) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
};

// Get assignments by technician ID
export const getAssignmentsByTechnician = async (technicianId) => {
    const response = await api.get(`/assignments/technician/${technicianId}`);
    return response.data;
};

// Create new assignment
export const createAssignment = async (assignmentData) => {
    const response = await api.post('/assignments', assignmentData);
    return response.data;
};

// Update assignment
export const updateAssignment = async (id, assignmentData) => {
    const response = await api.put(`/assignments/${id}`, assignmentData);
    return response.data;
};

// Assign technician to assignment
export const assignTechnician = async (id, technicianId) => {
    const response = await api.patch(`/assignments/${id}/assign`, { technicianId });
    return response.data;
};

// Delete assignment
export const deleteAssignment = async (id) => {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
};

// ============================================
// Treatment Preparation Operations
// ============================================

// Add treatment preparation item
export const addTreatmentPreparation = async (id, treatmentData) => {
    const response = await api.post(`/assignments/${id}/treatment-preparation`, treatmentData);
    return response.data;
};

// Update treatment preparation item
export const updateTreatmentPreparation = async (id, itemId, treatmentData) => {
    const response = await api.put(`/assignments/${id}/treatment-preparation/${itemId}`, treatmentData);
    return response.data;
};

// Delete treatment preparation item
export const deleteTreatmentPreparation = async (id, itemId) => {
    const response = await api.delete(`/assignments/${id}/treatment-preparation/${itemId}`);
    return response.data;
};

// ============================================
// Apply Treatment Operations (Site Pictures)
// ============================================

// Add site picture
export const addSitePicture = async (id, pictureData) => {
    const response = await api.post(`/assignments/${id}/site-pictures`, pictureData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Delete site picture
export const deleteSitePicture = async (id, pictureId) => {
    const response = await api.delete(`/assignments/${id}/site-pictures/${pictureId}`);
    return response.data;
};

// ============================================
// Payment Collection Operations
// ============================================

// Add payment collection record
export const addPaymentCollection = async (id, paymentData) => {
    const response = await api.post(`/assignments/${id}/payment-collection`, paymentData);
    return response.data;
};

// Update payment collection record
export const updatePaymentCollection = async (id, paymentData) => {
    const response = await api.put(`/assignments/${id}/payment-collection`, paymentData);
    return response.data;
};

// Delete payment collection record
export const deletePaymentCollection = async (id) => {
    const response = await api.delete(`/assignments/${id}/payment-collection`);
    return response.data;
};

// ============================================
// Service Status Operations
// ============================================

export const updateServiceStatus = async (id, subServiceId, status) => {
    const response = await api.patch(`/assignments/${id}/service-done/${subServiceId}`, { status });
    return response.data;
};
