import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Wrench, MapPin, Phone, AlertCircle, X } from 'lucide-react';
import bookingService from '../services/bookingService';
import customerService from '../services/customerService';
import serviceService from '../services/serviceService';
import { toast } from 'react-hot-toast';

const CreateBooking = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [services, setServices] = useState([]);
    const [allSubServices, setAllSubServices] = useState([]);
    const [formData, setFormData] = useState({
        customerId: '',
        serviceId: '',
        subServiceIds: [],
        additionalAddress: '',
        additionalMobileNo: '',
        deadlineDate: '',
    });

    // Fetch customers and services on mount
    useEffect(() => {
        fetchCustomers();
        fetchServices();
        if (isEditMode) {
            fetchBooking();
        }
    }, [id]);

    const fetchCustomers = async () => {
        try {
            const response = await customerService.getAllCustomers();
            setCustomers(response.data.customers || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to load customers');
        }
    };

    const fetchServices = async () => {
        try {
            const [servicesRes, subServicesRes] = await Promise.all([
                serviceService.getAllServices(),
                serviceService.getAllSubServices({ limit: 1000 })
            ]);
            setServices(servicesRes.data || []);
            setAllSubServices(subServicesRes.data || []);
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Failed to load services');
        }
    };

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const response = await bookingService.getBookingById(id);
            const booking = response.data.booking;
            setFormData({
                customerId: booking.customerId?._id || booking.customerId || '',
                serviceId: booking.serviceId?._id || booking.serviceId || '',
                subServiceIds: booking.subServiceIds || [],
                additionalAddress: booking.additionalAddress || '',
                additionalMobileNo: booking.additionalMobileNo || '',
                deadlineDate: booking.deadlineDate ? new Date(booking.deadlineDate).toISOString().split('T')[0] : '',
            });
        } catch (error) {
            console.error('Error fetching booking:', error);
            toast.error('Failed to load booking data');
            navigate('/bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous errors
        setValidationErrors([]);

        try {
            setLoading(true);

            // Create payload without serviceId
            const submissionPayload = {
                customerId: formData.customerId,
                subServiceIds: formData.subServiceIds,
                additionalAddress: formData.additionalAddress,
                additionalMobileNo: formData.additionalMobileNo,
                deadlineDate: formData.deadlineDate,
            };

            if (isEditMode) {
                await bookingService.updateBooking(id, submissionPayload);
                toast.success('Booking updated successfully');
            } else {
                await bookingService.createBooking(submissionPayload);
                toast.success('Booking created successfully');
            }
            navigate('/bookings');
        } catch (error) {
            console.error('Error saving booking:', error);

            // Handle validation errors from backend
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                setValidationErrors(error.response.data.errors);
                error.response.data.errors.forEach((err) => {
                    toast.error(err);
                });
            } else if (error.response?.data?.message) {
                const errorMsg = error.response.data.message;
                setValidationErrors([errorMsg]);
                toast.error(errorMsg);
            } else {
                const fallbackMsg = 'Failed to save booking. Please try again.';
                setValidationErrors([fallbackMsg]);
                toast.error(fallbackMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/bookings')}
                    className="p-2 hover:bg-dark-surface border border-dark-border rounded-lg transition-colors duration-200"
                >
                    <ArrowLeft className="w-5 h-5 text-dark-text" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-dark-text">
                        {isEditMode ? 'Edit Booking' : 'Create New Booking'}
                    </h1>
                    <p className="text-dark-text-secondary mt-1">
                        {isEditMode ? 'Update booking information' : 'Create a new customer booking'}
                    </p>
                </div>
            </div>

            {/* Validation Errors Alert */}
            {validationErrors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-fade-in">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-red-400 mb-2">
                                Please fix the following errors:
                            </h3>
                            <ul className="space-y-1">
                                {validationErrors.map((error, index) => (
                                    <li key={index} className="text-sm text-red-300 flex items-start gap-2">
                                        <span className="text-red-400 mt-1">•</span>
                                        <span>{error}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button
                            onClick={() => setValidationErrors([])}
                            className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Dismiss"
                        >
                            <X className="w-4 h-4 text-red-400" />
                        </button>
                    </div>
                </div>
            )}

            {/* Form */}
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer & Service Selection */}
                    <div>
                        <h2 className="text-xl font-semibold text-dark-text mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary-400" />
                            Booking Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Customer <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="customerId"
                                    value={formData.customerId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map((customer) => (
                                        <option key={customer._id} value={customer._id}>
                                            {customer.fullName} - {customer.mobileNo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Filter by Service Category
                                </label>
                                <select
                                    name="serviceId"
                                    value={formData.serviceId}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            serviceId: e.target.value
                                        }));
                                    }}
                                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                >
                                    <option value="">All Services</option>
                                    {services.map((service) => (
                                        <option key={service._id} value={service._id}>
                                            {service.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Selected Sub Services Summary */}
                            {formData.subServiceIds.length > 0 && (
                                <div className="col-span-1 md:col-span-2 space-y-3">
                                    <label className="block text-sm font-medium text-dark-text">
                                        Selected Services ({formData.subServiceIds.length})
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.subServiceIds.map(id => {
                                            const sub = allSubServices.find(s => s._id === id);
                                            if (!sub) return null;

                                            return (
                                                <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-lg text-sm">
                                                    <span>{sub.title}</span>
                                                    <span className="text-xs opacity-70">({sub.serviceId?.title || 'Unknown'})</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                subServiceIds: prev.subServiceIds.filter(sid => sid !== id)
                                                            }));
                                                        }}
                                                        className="hover:text-red-400 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Sub Service Selection Grid */}
                            <div className="col-span-1 md:col-span-2 bg-dark-bg/50 border border-dark-border rounded-lg p-4">
                                <label className="block text-sm font-medium text-dark-text mb-3">
                                    {formData.serviceId
                                        ? `Services from "${services.find(s => s._id === formData.serviceId)?.title}"`
                                        : "All Available Services"}
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                                    {allSubServices
                                        .filter(sub => !formData.serviceId || sub.serviceId?._id === formData.serviceId || sub.serviceId === formData.serviceId)
                                        .map((subService) => (
                                            <div
                                                key={subService._id}
                                                className={`
                                                relative flex items-start p-3 rounded-lg border cursor-pointer transition-all duration-200
                                                ${formData.subServiceIds.includes(subService._id)
                                                        ? 'bg-primary-500/10 border-primary-500/50'
                                                        : 'bg-dark-surface border-dark-border hover:border-dark-text-tertiary'}
                                            `}
                                                onClick={() => {
                                                    setFormData(prev => {
                                                        const currentIds = prev.subServiceIds || [];
                                                        const exists = currentIds.includes(subService._id);
                                                        return {
                                                            ...prev,
                                                            subServiceIds: exists
                                                                ? currentIds.filter(id => id !== subService._id)
                                                                : [...currentIds, subService._id]
                                                        };
                                                    });
                                                }}
                                            >
                                                <div className="flex items-center h-5">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.subServiceIds.includes(subService._id)}
                                                        onChange={() => { }} // Handled by parent div onClick
                                                        className="w-4 h-4 text-primary-600 bg-dark-bg border-dark-border rounded focus:ring-primary-500"
                                                    />
                                                </div>
                                                <div className="ml-3 text-sm">
                                                    <label className="font-medium text-dark-text cursor-pointer">
                                                        {subService.title}
                                                    </label>
                                                    <div className="flex justify-between items-center mt-1 w-full gap-2">
                                                        <p className="text-dark-text-tertiary text-xs">
                                                            ₹{subService.startingPrice}
                                                        </p>
                                                        {!formData.serviceId && (
                                                            <span className="text-[10px] bg-dark-surface px-1.5 py-0.5 rounded text-dark-text-secondary border border-dark-border">
                                                                {subService.serviceId?.title}
                                                            </span>
                                                        )}
                                                    </div>

                                                </div>
                                            </div>
                                        ))}
                                    {allSubServices.filter(sub => !formData.serviceId || sub.serviceId?._id === formData.serviceId || sub.serviceId === formData.serviceId).length === 0 && (
                                        <div className="col-span-full text-center py-8 text-dark-text-tertiary">
                                            No services found.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Total Amount Display */}
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex justify-end items-center p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                                    <span className="text-dark-text-secondary mr-2">Total Amount:</span>
                                    <span className="text-2xl font-bold text-primary-400">
                                        ₹{formData.subServiceIds.reduce((sum, id) => {
                                            const sub = allSubServices.find(s => s._id === id);
                                            return sum + (sub?.startingPrice || 0);
                                        }, 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="pt-6 border-t border-dark-border">
                        <h2 className="text-xl font-semibold text-dark-text mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-primary-400" />
                            Additional Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Mobile Number <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="additionalMobileNo"
                                    value={formData.additionalMobileNo}
                                    onChange={handleInputChange}
                                    required
                                    pattern="[0-9]{10}"
                                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    placeholder="10-digit mobile number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Deadline Date <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="deadlineDate"
                                    value={formData.deadlineDate}
                                    onChange={handleInputChange}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                />
                                <p className="text-xs text-dark-text-tertiary mt-2">
                                    Select the deadline for this booking
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="pt-6 border-t border-dark-border">
                        <h2 className="text-xl font-semibold text-dark-text mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary-400" />
                            Service Address
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Complete Address <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                name="additionalAddress"
                                value={formData.additionalAddress}
                                onChange={handleInputChange}
                                required
                                minLength="10"
                                maxLength="500"
                                rows="4"
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 resize-none"
                                placeholder="Enter complete service address with landmarks"
                            />
                            <p className="text-xs text-dark-text-tertiary mt-2">
                                Minimum 10 characters, maximum 500 characters
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Saving...' : isEditMode ? 'Update Booking' : 'Create Booking'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/bookings')}
                            className="px-8 py-3 bg-dark-bg border border-dark-border text-dark-text rounded-xl font-semibold hover:bg-dark-surface-hover transition-all duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBooking;
