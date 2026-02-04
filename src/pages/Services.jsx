import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bug,
    Plus,
    Search,
    Edit,
    Trash2,
    Loader2,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Image as ImageIcon
} from 'lucide-react';
import { useServices } from '../context/ServiceContext';
import { useSearch } from '../context/SearchContext';

const Services = () => {
    const navigate = useNavigate();
    const {
        services,
        loading,
        error: contextError,
        createService,
        updateService,
        deleteService,
        addSubService,
        updateSubService,
        deleteSubService
    } = useServices();

    const { searchQuery, setSearchQuery } = useSearch();
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [localError, setLocalError] = useState(null);

    // Form States
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
        image: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        metaImage: '',
    });

    const handleCreateService = async (e) => {
        e.preventDefault();
        setLocalError(null);
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
                data.append('image', formData.image);
            }

            if (selectedService) {
                await updateService(selectedService._id, data);
            } else {
                await createService(data);
            }
            setShowModal(false);
            resetForm();
        } catch (err) {
            setLocalError(err.response?.data?.message || 'Failed to save service');
        }
    };

    const handleDeleteService = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await deleteService(id);
            } catch (err) {
                setLocalError('Failed to delete service');
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
        setLocalError(null);
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
            image: '',
            metaTitle: '',
            metaDescription: '',
            metaKeywords: '',
            metaImage: '',
        });
        setImageFile(null);
        setSelectedSubService(null);
        setLocalError(null);
    };

    const openAddSubServiceModal = (serviceId) => {
        resetSubServiceForm();
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
        setLocalError(null);
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
        } catch (err) {
            setLocalError(err.response?.data?.message || 'Failed to save sub-service');
        }
    };

    const handleDeleteSubService = async (serviceId, subServiceId) => {
        if (window.confirm('Are you sure you want to delete this sub-service?')) {
            try {
                await deleteSubService(serviceId, subServiceId);
            } catch (err) {
                setLocalError('Failed to delete sub-service');
            }
        }
    };

    const filteredServices = services.filter((service) =>
        service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && services.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        );
    }

    const error = contextError || localError;

    return (
        <div className="space-y-6 animate-fade-in p-4 md:p-6 pb-24 md:pb-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark-text mb-2">Services</h1>
                    <p className="text-dark-text-secondary text-sm md:text-base">
                        Manage your pest control services and packages
                    </p>
                </div>
                <button
                    onClick={() => navigate('/services/create')}
                    className="flex items-center justify-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200 w-full md:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    Add Service
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 md:p-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-sm text-dark-text placeholder:text-dark-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                    />
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                    <div
                        key={service._id}
                        className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 flex flex-col"
                    >
                        {/* Service Header */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {service.image ? (
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Bug className="w-8 h-8 text-primary-400" />
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEditModal(service)}
                                        className="p-2 hover:bg-primary-500/10 text-primary-400 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteService(service._id)}
                                        className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-dark-text mb-2 capitalize line-clamp-1">
                                {service.title}
                            </h3>
                            <p className="text-sm text-dark-text-secondary mb-4 line-clamp-3 flex-1">
                                {service.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-dark-border">
                                <span className="text-xs text-dark-text-tertiary flex items-center gap-1">
                                    <Bug className="w-3 h-3" />
                                    {service.services?.length || 0} Sub-services
                                </span>
                                <button
                                    onClick={() => toggleServiceExpand(service._id)}
                                    className="text-xs font-medium text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
                                >
                                    {expandedServices[service._id] ? (
                                        <>Hide <ChevronUp className="w-3 h-3" /></>
                                    ) : (
                                        <>View All <ChevronDown className="w-3 h-3" /></>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Expandable Sub-services Section */}
                        {expandedServices[service._id] && (
                            <div className="border-t border-dark-border bg-dark-bg/50 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-dark-text">Sub-services</h4>
                                    <button
                                        onClick={() => openAddSubServiceModal(service._id)}
                                        className="text-xs flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
                                    >
                                        <Plus className="w-3 h-3" /> Add
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                    {service.services && service.services.length > 0 ? (
                                        service.services.map((subService) => (
                                            <div
                                                key={subService._id}
                                                className="bg-dark-surface border border-dark-border rounded-xl p-3 hover:border-primary-500/30 transition-all"
                                            >
                                                <div className="flex items-start gap-3">
                                                    {subService.image && (
                                                        <div className="w-10 h-10 rounded-lg bg-dark-bg overflow-hidden flex-shrink-0">
                                                            <img src={subService.image} alt={subService.title} className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <h5 className="text-sm font-semibold text-dark-text truncate">
                                                                {subService.title}
                                                            </h5>
                                                            <span className="text-xs font-medium text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded whitespace-nowrap ml-2">
                                                                ${subService.startingPrice}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-dark-text-secondary truncate mt-0.5">
                                                            {subService.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-dark-border/50">
                                                    <button
                                                        onClick={() => openEditSubServiceModal(service._id, subService)}
                                                        className="text-xs text-primary-400 hover:text-primary-300"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSubService(service._id, subService._id)}
                                                        className="text-xs text-red-400 hover:text-red-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-xs text-dark-text-tertiary py-4">
                                            No sub-services yet.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredServices.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6">
                    <Bug className="w-16 h-16 text-dark-text-tertiary mb-4" />
                    <h3 className="text-xl font-bold text-dark-text mb-2">
                        No services found
                    </h3>
                    <p className="text-dark-text-secondary mb-6">
                        {searchQuery
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

            {/* Main Service Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
                    <div className="bg-dark-surface border-t md:border border-dark-border rounded-t-3xl md:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-surface z-10">
                            <h2 className="text-xl font-bold text-dark-text">
                                {selectedService ? 'Edit Service' : 'Add New Service'}
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="p-2 hover:bg-dark-bg rounded-lg text-dark-text-secondary transition-colors"
                            >
                                <plus className="w-6 h-6 rotate-45" /> {/* Close icon using Plus rotated, or just import X */}
                                <span className="sr-only">Close</span>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateService} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Service Image
                                </label>
                                <div className="space-y-3">
                                    {(imageFile || formData.image) && (
                                        <div className="w-full h-40 bg-dark-bg border border-dark-border rounded-lg overflow-hidden flex items-center justify-center relative group">
                                            <img
                                                src={imageFile ? URL.createObjectURL(imageFile) : formData.image}
                                                alt="Preview"
                                                className="h-full object-contain"
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-dark-bg border border-dark-border rounded-lg hover:bg-dark-surface-hover transition-colors">
                                            <ImageIcon className="w-5 h-5 text-dark-text-secondary" />
                                            <span className="text-sm text-dark-text">Choose Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setImageFile(e.target.files[0])}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* SEO Section Toggle or just inline */}
                            <div className="border-t border-dark-border pt-4 mt-4">
                                <h3 className="text-sm font-bold text-dark-text mb-3">SEO Configuration</h3>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Meta Title"
                                        value={formData.metaTitle}
                                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text text-sm focus:outline-none focus:border-primary-500"
                                    />
                                    <textarea
                                        placeholder="Meta Description"
                                        value={formData.metaDescription}
                                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text text-sm focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 sticky bottom-0 bg-dark-surface border-t border-dark-border -mx-6 -mb-6 p-6">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 px-6 py-3 bg-dark-bg border border-dark-border rounded-xl font-semibold text-dark-text hover:bg-dark-surface-hover"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg"
                                >
                                    {selectedService ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sub-Service Modal */}
            {showSubServiceModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
                    <div className="bg-dark-surface border-t md:border border-dark-border rounded-t-3xl md:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-surface z-10">
                            <h2 className="text-xl font-bold text-dark-text">
                                {selectedSubService ? 'Edit Sub-Service' : 'Add Sub-Service'}
                            </h2>
                            <button
                                onClick={() => { setShowSubServiceModal(false); resetSubServiceForm(); }}
                                className="p-2 hover:bg-dark-bg rounded-lg text-dark-text-secondary transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubServiceSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={subServiceFormData.title}
                                    onChange={(e) => setSubServiceFormData({ ...subServiceFormData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-text mb-2">
                                        Price ($) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={subServiceFormData.startingPrice}
                                        onChange={(e) => setSubServiceFormData({ ...subServiceFormData, startingPrice: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <label className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg hover:bg-dark-surface-hover transition-colors h-[46px]">
                                        <ImageIcon className="w-5 h-5 text-dark-text-secondary" />
                                        <span className="text-sm text-dark-text truncate">{imageFile ? 'File Selected' : 'Image'}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {(imageFile || subServiceFormData.image) && (
                                <div className="w-full h-32 bg-dark-bg border border-dark-border rounded-lg overflow-hidden flex items-center justify-center relative">
                                    <img
                                        src={imageFile ? URL.createObjectURL(imageFile) : subServiceFormData.image}
                                        alt="Preview"
                                        className="h-full object-contain"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={subServiceFormData.description}
                                    onChange={(e) => setSubServiceFormData({ ...subServiceFormData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4 sticky bottom-0 bg-dark-surface border-t border-dark-border -mx-6 -mb-6 p-6">
                                <button
                                    type="button"
                                    onClick={() => { setShowSubServiceModal(false); resetSubServiceForm(); }}
                                    className="flex-1 px-6 py-3 bg-dark-bg border border-dark-border rounded-xl font-semibold text-dark-text hover:bg-dark-surface-hover"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg"
                                >
                                    {selectedSubService ? 'Update' : 'Add'}
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
