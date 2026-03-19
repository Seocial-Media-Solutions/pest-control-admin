import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, EyeOff, User, Mail, Phone, MapPin, Lock, FileText, AlertCircle, X } from 'lucide-react';
import customerService from '../services/customerService';
import { toast } from 'react-hot-toast';

const CreateCustomer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobileNo: '',
        googleMapLink: '',
        status: 'temporary',
        notes: '',
    });

    // Fetch customer data if editing
    useEffect(() => {
        if (isEditMode) {
            fetchCustomer();
        }
    }, [id]);

    const fetchCustomer = async () => {
        try {
            setLoading(true);
            const response = await customerService.getCustomerById(id);
            const customer = response.data;
            setFormData({
                fullName: customer.fullName,
                email: customer.email,
                mobileNo: customer.mobileNo,
                googleMapLink: customer.googleMapLink || '',
                status: customer.status,
                notes: customer.notes || '',
            });
        } catch (error) {
            console.error('Error fetching customer:', error);
            toast.error('Failed to load customer data');
            navigate('/customers');
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



        const toastId = toast.loading(isEditMode ? 'Updating customer...' : 'Creating customer...');
        try {
            setLoading(true);
            if (isEditMode) {
                const updateData = { ...formData };
                await customerService.updateCustomer(id, updateData);
                toast.success('Customer updated successfully', { id: toastId });
            } else {
                await customerService.createCustomer(formData);
                toast.success('Customer created successfully', { id: toastId });
            }
            navigate('/customers');
        } catch (error) {
            console.error('Error saving customer:', error);

            // Handle validation errors from backend
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                setValidationErrors(error.response.data.errors);
                toast.error('Validation failed. Check the form for errors.', { id: toastId });
            } else if (error.response?.data?.message) {
                const errorMsg = error.response.data.message;
                setValidationErrors([errorMsg]);
                toast.error(errorMsg, { id: toastId });
            } else {
                const fallbackMsg = 'Failed to save customer. Please try again.';
                setValidationErrors([fallbackMsg]);
                toast.error(fallbackMsg, { id: toastId });
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
                    onClick={() => navigate('/customers')}
                    className="p-2 hover:bg-white border border-light-border rounded-lg transition-colors duration-200"
                >
                    <ArrowLeft className="w-5 h-5 text-light-text" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-light-text">
                        {isEditMode ? 'Edit Customer' : 'Add New Customer'}
                    </h1>
                    <p className="text-light-text-secondary mt-1">
                        {isEditMode ? 'Update customer information' : 'Create a new customer account'}
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
            <div className="bg-white border border-light-border rounded-2xl p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information Section */}
                    <div>
                        <h2 className="text-xl font-semibold text-light-text mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary-400" />
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-light-text mb-2">
                                    Full Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                    minLength="2"
                                    maxLength="100"
                                    className="w-full px-4 py-3 bg-light-bg border border-light-border rounded-lg text-light-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-light-text mb-2">
                                    Status <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-light-bg border border-light-border rounded-lg text-light-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                >
                                    <option value="regular">Regular</option>
                                    <option value="temporary">Temporary</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="pt-6 border-t border-light-border">
                        <h2 className="text-xl font-semibold text-light-text mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-primary-400" />
                            Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-light-text mb-2">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Email <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-light-bg border border-light-border rounded-lg text-light-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-light-text mb-2">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Mobile Number <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="mobileNo"
                                    value={formData.mobileNo}
                                    onChange={handleInputChange}
                                    required
                                    pattern="[0-9]{10}"
                                    className="w-full px-4 py-3 bg-light-bg border border-light-border rounded-lg text-light-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    placeholder="10-digit mobile number"
                                />
                            </div>
                        </div>
                    </div>



                    {/* Google Map Link Section */}
                    <div className="pt-6 border-t border-light-border">
                        <h2 className="text-xl font-semibold text-light-text mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary-400" />
                            Location
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-2">
                                Google Map Link <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="url"
                                name="googleMapLink"
                                value={formData.googleMapLink}
                                onChange={handleInputChange}
                                required
                                pattern="^https?:\/\/(www\.)?(google\.com\/maps|maps\.app\.goo\.gl|maps\.google\.com).*"
                                className="w-full px-4 py-3 bg-light-bg border border-light-border rounded-lg text-light-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                placeholder="https://maps.google.com/..."
                            />
                            <p className="text-xs text-light-text-tertiary mt-2">
                                Please paste a valid Google Maps URL.
                            </p>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="pt-6 border-t border-light-border">
                        <h2 className="text-xl font-semibold text-light-text mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary-400" />
                            Additional Notes
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                maxLength="1000"
                                rows="4"
                                className="w-full px-4 py-3 bg-light-bg border border-light-border rounded-lg text-light-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 resize-none"
                                placeholder="Any additional notes about the customer..."
                            />
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
                            {loading ? 'Saving...' : isEditMode ? 'Update Customer' : 'Create Customer'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/customers')}
                            className="px-8 py-3 bg-light-bg border border-light-border text-light-text rounded-xl font-semibold hover:bg-light-surface-hover transition-all duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCustomer;
