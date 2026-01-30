import api from './api';

// Get all technicians
export const getAllTechnicians = async () => {
    const response = await api.get('/technicians');
    return response.data;
};

// Get technician by ID
export const getTechnicianById = async (id) => {
    const response = await api.get(`/technicians/${id}`);
    return response.data;
};

// Create new technician
export const createTechnician = async (technicianData) => {
    const response = await api.post('/technicians', technicianData);
    return response.data;
};

// Update technician
export const updateTechnician = async (id, technicianData) => {
    const response = await api.put(`/technicians/${id}`, technicianData);
    return response.data;
};

// Delete technician
export const deleteTechnician = async (id) => {
    const response = await api.delete(`/technicians/${id}`);
    return response.data;
};

// Login technician
export const loginTechnician = async (credentials) => {
    const response = await api.post('/technicians/login', credentials);
    return response.data;
};

// Mark attendance for a technician
export const markAttendance = async (id, attendanceData) => {
    const response = await api.post(`/technicians/${id}/attendance`, attendanceData);
    return response.data;
};

// Get attendance by month (defaults to current month if no month provided)
export const getAttendanceByMonth = async (id, month = null) => {
    const url = month
        ? `/technicians/${id}/attendance/${month}`
        : `/technicians/${id}/attendance`;
    const response = await api.get(url);
    return response.data;
};
