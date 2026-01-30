import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bug,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Loader2,
    ChevronDown,
    ChevronUp,
    DollarSign,
} from 'lucide-react';
import {
    getAllServices,
    createService,
    updateService,
    deleteService,
    addSubService,
    updateSubService,
    deleteSubService,
} from '../services/serviceService';

const Services = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        metaImage: '',
    });
    const [imageFile, setImageFile] = useState(null);

    // Sub-service states
    const [expandedServices, setExpandedServices] = useState({});
    const [showSubServiceModal, setShowSubServiceModal] = useState(false);
    const [selectedSubService, setSelectedSubService] = useState(null);
    const [parentServiceId, setParentServiceId] = useState(null);
    const [subServiceFormData, setSubServiceFormData] = useState({
        title: '',
        description: '',
        startingPrice: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        metaImage: '',
    });

    // Fetch services on component mount
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const data = await getAllServices();
            setServices(data.data || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch services');
            console.error('Error fetching services:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateService = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('metaTitle', formData.metaTitle);
            data.append('metaDescription', formData.metaDescription);
            data.append('metaKeywords', formData.metaKeywords);
            data.append('metaImage', formData.metaImage);

            if (imageFile) {
                data.append('image', imageFile);
            } else if (formData.image) {
                // If editing and no new file, keep existing URL text if backend supports it or just don't send 'image' field if it's not changing
                data.append('image', formData.image);
            }

            if (selectedService) {
                await updateService(selectedService._id, data);
            } else {
                await createService(data);
            }
            setShowModal(false);
            resetForm();
            fetchServices();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save service');
            console.error('Error saving service:', err);
        }
    };

    const handleDeleteService = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await deleteService(id);
                fetchServices();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete service');
                console.error('Error deleting service:', err);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            image: '',
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
            metaImage: '',
        });
        setImageFile(null);
        setSelectedService(null);
    };

    const openEditModal = (service) => {
        setSelectedService(service);
        setFormData({
            title: service.title,
            description: service.description,
            image: service.image,
            metaTitle: service.metaTitle,
            metaDescription: service.metaDescription,
            metaKeywords: service.metaKeywords,
            metaImage: service.metaImage,
        });
        setImageFile(null);
        setShowModal(true);
    };

    // Sub-service handlers
    const toggleServiceExpand = (serviceId) => {
        setExpandedServices(prev => ({
            ...prev,
            [serviceId]: !prev[serviceId]
        }));
    };

    const resetSubServiceForm = () => {
        setSubServiceFormData({
            title: '',
            description: '',
            startingPrice: '',
            image: '', // Add image field
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
            metaImage: '',
        });
        setImageFile(null);
        setSelectedSubService(null);
    };

    const openAddSubServiceModal = (serviceId) => {
        setSubServiceFormData({
            title: '',
            description: '',
            startingPrice: '',
            image: '',
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
            metaImage: '',
        });
        setImageFile(null);
        setSelectedSubService(null);
        setParentServiceId(serviceId);
        setShowSubServiceModal(true);
    };

    const openEditSubServiceModal = (serviceId, subService) => {
        setParentServiceId(serviceId);
        setSelectedSubService(subService);
        setSubServiceFormData({
            title: subService.title,
            description: subService.description,
            startingPrice: subService.startingPrice,
            image: subService.image,
            metaTitle: subService.metaTitle,
            metaDescription: subService.metaDescription,
            metaKeywords: subService.metaKeywords,
            metaImage: subService.metaImage,
        });
        setImageFile(null);
        setShowSubServiceModal(true);
    };

    const handleSubServiceSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('title', subServiceFormData.title);
            data.append('description', subServiceFormData.description);
            data.append('startingPrice', subServiceFormData.startingPrice);
            data.append('metaTitle', subServiceFormData.metaTitle);
            data.append('metaDescription', subServiceFormData.metaDescription);
            data.append('metaKeywords', subServiceFormData.metaKeywords);
            data.append('metaImage', subServiceFormData.metaImage);

            if (imageFile) {
                data.append('image', imageFile);
            } else if (subServiceFormData.image) {
                data.append('image', subServiceFormData.image);
            }

            if (selectedSubService) {
                await updateSubService(parentServiceId, selectedSubService._id, data);
            } else {
                await addSubService(parentServiceId, data);
            }
            setShowSubServiceModal(false);
            resetSubServiceForm();
            setImageFile(null); // Clear image file
            fetchServices();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save sub-service');
            console.error('Error saving sub-service:', err);
        }
    };

    const handleDeleteSubService = async (serviceId, subServiceId) => {
        if (window.confirm('Are you sure you want to delete this sub-service?')) {
            try {
                await deleteSubService(serviceId, subServiceId);
                fetchServices();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete sub-service');
                console.error('Error deleting sub-service:', err);
            }
        }
    };

    const filteredServices = services.filter((service) =>
        service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-dark-text mb-2">Services</h1>
                    <p className="text-dark-text-secondary">
                        Manage your pest control services and packages
                    </p>
                </div>
                <button
                    onClick={() => navigate('/services/create')}
                    className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                    <Plus className="w-5 h-5" />
                    Add Service
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
                    {error}
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-sm text-dark-text placeholder:text-dark-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                        />
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 gap-6">
                {filteredServices.map((service) => (
                    <div
                        key={service._id}
                        className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10"
                    >
                        {/* Service Header */}
                        <div className="flex items-start gap-4 p-6">
                            {/* Service Image */}
                            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {service.image ? (
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Bug className="w-12 h-12 text-primary-400" />
                                )}
                            </div>

                            {/* Service Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-bold text-dark-text mb-2 capitalize">
                                    {service.title}
                                </h3>
                                <p className="text-sm text-dark-text-secondary mb-3">
                                    {service.description}
                                </p>

                                {/* Meta Info */}
                                <div className="flex flex-wrap gap-4 text-xs text-dark-text-tertiary mb-4">
                                    <span className="flex items-center gap-1">
                                        <Bug className="w-3 h-3" />
                                        {service.services?.length || 0} Sub-services
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleServiceExpand(service._id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-accent-500/10 text-accent-400 rounded-lg hover:bg-accent-500/20 transition-colors duration-200"
                                    >
                                        {expandedServices[service._id] ? (
                                            <>
                                                <ChevronUp className="w-4 h-4" />
                                                Hide Sub-services
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4" />
                                                View Sub-services
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => openAddSubServiceModal(service._id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors duration-200"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Sub-service
                                    </button>
                                    <button
                                        onClick={() => openEditModal(service)}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 transition-colors duration-200"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteService(service._id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors duration-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Expandable Sub-services Section */}
                        {expandedServices[service._id] && (
                            <div className="border-t border-dark-border bg-dark-bg/50 p-6">
                                <h4 className="text-lg font-bold text-dark-text mb-4">
                                    Sub-services ({service.services?.length || 0})
                                </h4>

                                {service.services && service.services.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {service.services.map((subService) => (
                                            <div
                                                key={subService._id}
                                                className="bg-dark-surface border border-dark-border rounded-xl p-4 hover:border-primary-500/50 transition-all duration-200"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        {subService.image && (
                                                            <div className="w-12 h-12 rounded-lg bg-dark-bg border border-dark-border overflow-hidden flex-shrink-0">
                                                                <img src={subService.image} alt={subService.title} className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <h5 className="text-base font-semibold text-dark-text capitalize">
                                                            {subService.title}
                                                        </h5>
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-primary-500/10 text-primary-400 px-2 py-1 rounded-lg text-xs font-semibold">
                                                        <DollarSign className="w-3 h-3" />
                                                        {subService.startingPrice}
                                                    </div>
                                                </div>

                                                <p className="text-xs text-dark-text-secondary mb-4 line-clamp-2">
                                                    {subService.description}
                                                </p>

                                                {/* Sub-service Meta */}
                                                {subService.metaTitle && (
                                                    <div className="mb-3 pb-3 border-b border-dark-border">
                                                        <p className="text-xs text-dark-text-tertiary mb-1">
                                                            <span className="font-semibold">SEO Title:</span> {subService.metaTitle}
                                                        </p>
                                                        {subService.metaDescription && (
                                                            <p className="text-xs text-dark-text-tertiary line-clamp-1">
                                                                <span className="font-semibold">Description:</span> {subService.metaDescription}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Sub-service Actions */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditSubServiceModal(service._id, subService)}
                                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 transition-colors duration-200 text-xs"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSubService(service._id, subService._id)}
                                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors duration-200 text-xs"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Bug className="w-12 h-12 text-dark-text-tertiary mx-auto mb-3" />
                                        <p className="text-dark-text-secondary mb-4">
                                            No sub-services yet
                                        </p>
                                        <button
                                            onClick={() => openAddSubServiceModal(service._id)}
                                            className="inline-flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add First Sub-service
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredServices.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
                    <Bug className="w-16 h-16 text-dark-text-tertiary mb-4" />
                    <h3 className="text-xl font-bold text-dark-text mb-2">
                        No services found
                    </h3>
                    <p className="text-dark-text-secondary mb-6">
                        {searchTerm
                            ? 'Try adjusting your search terms'
                            : 'Get started by creating your first service'}
                    </p>
                    <button
                        onClick={() => navigate('/services/create')}
                        className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200"
                    >
                        <Plus className="w-5 h-5" />
                        Add Service
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-dark-surface border border-dark-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-dark-border">
                            <h2 className="text-2xl font-bold text-dark-text">
                                {selectedService ? 'Edit Service' : 'Add New Service'}
                            </h2>
                        </div>

                        <form onSubmit={handleCreateService} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Service Image
                                </label>
                                <div className="space-y-2">
                                    {(imageFile || formData.image) && (
                                        <div className="w-full h-40 bg-dark-bg border border-dark-border rounded-lg overflow-hidden flex items-center justify-center">
                                            <img
                                                src={imageFile ? URL.createObjectURL(imageFile) : formData.image}
                                                alt="Preview"
                                                className="h-full object-contain"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files[0])}
                                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500/10 file:text-primary-400 hover:file:bg-primary-500/20"
                                    />
                                    <p className="text-xs text-dark-text-tertiary">Allowed formats: JPG, PNG, WEBP. Max size: 5MB.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-text mb-2">
                                        Meta Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.metaTitle}
                                        onChange={(e) =>
                                            setFormData({ ...formData, metaTitle: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-text mb-2">
                                        Meta Image URL
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.metaImage}
                                        onChange={(e) =>
                                            setFormData({ ...formData, metaImage: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Meta Description
                                </label>
                                <textarea
                                    value={formData.metaDescription}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            metaDescription: e.target.value,
                                        })
                                    }
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Meta Keywords
                                </label>
                                <input
                                    type="text"
                                    value={formData.metaKeywords}
                                    onChange={(e) =>
                                        setFormData({ ...formData, metaKeywords: e.target.value })
                                    }
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-6 py-3 bg-dark-bg border border-dark-border rounded-xl font-semibold text-dark-text hover:bg-dark-surface-hover transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200"
                                >
                                    {selectedService ? 'Update Service' : 'Create Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sub-Service Modal */}
            {showSubServiceModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-dark-surface border border-dark-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-dark-border">
                            <h2 className="text-2xl font-bold text-dark-text">
                                {selectedSubService ? 'Edit Sub-Service' : 'Add New Sub-Service'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubServiceSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Sub-Service Image
                                </label>
                                <div className="space-y-2">
                                    {(imageFile || subServiceFormData.image) && (
                                        <div className="w-full h-40 bg-dark-bg border border-dark-border rounded-lg overflow-hidden flex items-center justify-center">
                                            <img
                                                src={imageFile ? URL.createObjectURL(imageFile) : subServiceFormData.image}
                                                alt="Preview"
                                                className="h-full object-contain"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files[0])}
                                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500/10 file:text-primary-400 hover:file:bg-primary-500/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-text mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={subServiceFormData.title}
                                        onChange={(e) =>
                                            setSubServiceFormData({ ...subServiceFormData, title: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-text mb-2">
                                        Starting Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={subServiceFormData.startingPrice}
                                        onChange={(e) =>
                                            setSubServiceFormData({ ...subServiceFormData, startingPrice: e.target.value })
                                        }
                                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={subServiceFormData.description}
                                    onChange={(e) =>
                                        setSubServiceFormData({ ...subServiceFormData, description: e.target.value })
                                    }
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    required
                                />
                            </div>

                            <div className="border-t border-dark-border pt-4">
                                <h3 className="text-lg font-semibold text-dark-text mb-4">SEO Metadata</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Meta Title
                                        </label>
                                        <input
                                            type="text"
                                            value={subServiceFormData.metaTitle}
                                            onChange={(e) =>
                                                setSubServiceFormData({ ...subServiceFormData, metaTitle: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Meta Description
                                        </label>
                                        <textarea
                                            value={subServiceFormData.metaDescription}
                                            onChange={(e) =>
                                                setSubServiceFormData({
                                                    ...subServiceFormData,
                                                    metaDescription: e.target.value,
                                                })
                                            }
                                            rows={2}
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Meta Keywords
                                        </label>
                                        <input
                                            type="text"
                                            value={subServiceFormData.metaKeywords}
                                            onChange={(e) =>
                                                setSubServiceFormData({ ...subServiceFormData, metaKeywords: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Meta Image URL
                                        </label>
                                        <input
                                            type="text"
                                            value={subServiceFormData.metaImage}
                                            onChange={(e) =>
                                                setSubServiceFormData({ ...subServiceFormData, metaImage: e.target.value })
                                            }
                                            required
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSubServiceModal(false);
                                        resetSubServiceForm();
                                    }}
                                    className="flex-1 px-6 py-3 bg-dark-bg border border-dark-border rounded-xl font-semibold text-dark-text hover:bg-dark-surface-hover transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200"
                                >
                                    {selectedSubService ? 'Update Sub-Service' : 'Create Sub-Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
