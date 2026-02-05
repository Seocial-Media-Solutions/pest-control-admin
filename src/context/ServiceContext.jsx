import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import {
    getAllServices as fetchAllServices,
    createService as apiCreateService,
    updateService as apiUpdateService,
    deleteService as apiDeleteService,
    addSubService as apiAddSubService,
    updateSubService as apiUpdateSubService,
    deleteSubService as apiDeleteSubService,
} from '../services/serviceService';

const ServiceContext = createContext();

export const useServices = () => {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error('useServices must be used within a ServiceProvider');
    }
    return context;
};

export const ServiceProvider = ({ children }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, loading: authLoading } = useAuth();

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAllServices();
            setServices(data.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError(err.response?.data?.message || 'Failed to fetch services');
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchServices();
        }
    }, [fetchServices, isAuthenticated, authLoading]);

    const createService = async (serviceData) => {
        try {
            const response = await apiCreateService(serviceData);
            setServices(prev => [response.data, ...prev]);
            toast.success('Service created successfully');
            return response.data;
        } catch (err) {
            console.error('Error creating service:', err);
            const message = err.response?.data?.message || 'Failed to create service';
            toast.error(message);
            throw err;
        }
    };

    const updateService = async (id, serviceData) => {
        try {
            const response = await apiUpdateService(id, serviceData);
            setServices(prev => prev.map(s => s._id === id ? response.data : s));
            toast.success('Service updated successfully');
            return response.data;
        } catch (err) {
            console.error('Error updating service:', err);
            const message = err.response?.data?.message || 'Failed to update service';
            toast.error(message);
            throw err;
        }
    };

    const deleteService = async (id) => {
        try {
            await apiDeleteService(id);
            setServices(prev => prev.filter(s => s._id !== id));
            toast.success('Service deleted successfully');
        } catch (err) {
            console.error('Error deleting service:', err);
            const message = err.response?.data?.message || 'Failed to delete service';
            toast.error(message);
            throw err;
        }
    };

    const addSubService = async (serviceId, subServiceData) => {
        try {
            const response = await apiAddSubService(serviceId, subServiceData);
            // The API usually returns the updated service or the new sub-service.
            // Assuming we need to refetch or update the specific service in the list.
            // A simple way is to refetch all, or update locally if we know the structure.
            // For now, let's refresh the list to be safe and consistent.
            await fetchServices();
            toast.success('Sub-service added successfully');
            return response.data;
        } catch (err) {
            console.error('Error adding sub-service:', err);
            const message = err.response?.data?.message || 'Failed to add sub-service';
            toast.error(message);
            throw err;
        }
    };

    const updateSubService = async (serviceId, subServiceId, subServiceData) => {
        try {
            await apiUpdateSubService(serviceId, subServiceId, subServiceData);
            await fetchServices();
            toast.success('Sub-service updated successfully');
        } catch (err) {
            console.error('Error updating sub-service:', err);
            const message = err.response?.data?.message || 'Failed to update sub-service';
            toast.error(message);
            throw err;
        }
    };

    const deleteSubService = async (serviceId, subServiceId) => {
        try {
            await apiDeleteSubService(serviceId, subServiceId);
            await fetchServices();
            toast.success('Sub-service deleted successfully');
        } catch (err) {
            console.error('Error deleting sub-service:', err);
            const message = err.response?.data?.message || 'Failed to delete sub-service';
            toast.error(message);
            throw err;
        }
    };

    const value = {
        services,
        loading,
        error,
        fetchServices,
        createService,
        updateService,
        deleteService,
        addSubService,
        updateSubService,
        deleteSubService,
    };

    return (
        <ServiceContext.Provider value={value}>
            {children}
        </ServiceContext.Provider>
    );
};
