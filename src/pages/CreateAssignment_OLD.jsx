import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList,
    ArrowLeft,
    Save,
    User,
    Phone,
    MapPin,
    DollarSign,
    FileText,
    Briefcase,
    Calendar,
    Loader2,
    List,
} from 'lucide-react';
import { createAssignment } from '../services/assignmentService';
import { getAllTechnicians } from '../services/technicianService';
import { getAllServices } from '../services/serviceService';
import toast from 'react-hot-toast';

const CreateAssignment = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [technicians, setTechnicians] = useState([]);
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        serviceTitle: '',
        serviceType: '',
        serviceDescription: '',
        customer: {
            name: '',
            phone: '',
            address: '',
        },
        technicianId: '',
        serviceSteps: [],
        paymentstatus: 'pending',

        status: 'pending',
    });

    useEffect(() => {
        fetchTechnicians();
        fetchServices();
    }, []);

    const fetchTechnicians = async () => {
        try {
            const data = await getAllTechnicians();
            setTechnicians(data.data || []);
        } catch (err) {
            console.error('Error fetching technicians:', err);
            toast.error('Failed to load technicians');
        }
    };

    const fetchServices = async () => {
        try {
            const data = await getAllServices();
            setServices(data.data || []);
        } catch (err) {
            console.error('Error fetching services:', err);
            toast.error('Failed to load services');
        }
    };

    const handleServiceSelect = (serviceId) => {
        const selectedService = services.find(s => s._id === serviceId);
        if (selectedService) {
            setFormData(prev => ({
                ...prev,
                serviceTitle: selectedService.title,
                serviceDescription: selectedService.description || '',
                serviceSteps: selectedService.steps?.join(', ') || '',
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const assignmentData = {
                ...formData,
                serviceSteps: formData.serviceSteps
                    ? formData.serviceSteps.split(',').map((step) => step.trim())
                    : [],
                technicianId: formData.technicianId || null,
                paymentDate: formData.paymentDate || null,
            };

            await createAssignment(assignmentData);
            toast.success('Assignment created successfully!');
            navigate('/assignments');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create assignment');
            console.error('Error creating assignment:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCustomerChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            customer: {
                ...prev.customer,
                [field]: value,
            },
        }));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/assignments')}
                        className="p-2 hover:bg-dark-surface-hover rounded-lg transition-colors duration-200"
                    >
                        <ArrowLeft className="w-6 h-6 text-dark-text" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-dark-text mb-2">Create New Assignment</h1>
                        <p className="text-dark-text-secondary">
                            Fill in the details to create a new service assignment
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Information Card */}
                <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-dark-text">Service Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Service Selector */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                <div className="flex items-center gap-2">
                                    <List className="w-4 h-4" />
                                    Select Existing Service (Optional)
                                </div>
                            </label>
                            <select
                                onChange={(e) => handleServiceSelect(e.target.value)}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                            >
                                <option value="">-- Select a service to auto-fill details --</option>
                                {services.map((service) => (
                                    <option key={service._id} value={service._id}>
                                        {service.title}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-dark-text-tertiary mt-2">
                                Select a service to automatically populate the fields below, or fill them manually
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Service Title <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.serviceTitle}
                                onChange={(e) => handleInputChange('serviceTitle', e.target.value)}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                placeholder="e.g., Termite Control Service"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Service Type <span className="text-red-400">*</span>
                            </label>
                            <select
                                value={formData.serviceType}
                                onChange={(e) => handleInputChange('serviceType', e.target.value)}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                required
                            >
                                <option value="">Select service type</option>
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Industrial">Industrial</option>
                                <option value="Emergency">Emergency</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Service Description <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={formData.serviceDescription}
                                onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                placeholder="Describe the service requirements in detail..."
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Service Steps
                                <span className="text-dark-text-tertiary ml-2 text-xs">
                                    (Comma-separated)
                                </span>
                            </label>
                            <input
                                type="text"
                                value={formData.serviceSteps}
                                onChange={(e) => handleInputChange('serviceSteps', e.target.value)}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                placeholder="e.g., Inspection, Treatment, Follow-up, Final Report"
                            />
                            <p className="text-xs text-dark-text-tertiary mt-2">
                                Enter the steps required to complete this service, separated by commas
                            </p>
                        </div>
                    </div>
                </div>

                {/* Customer Information Card */}
                <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-dark-text">Customer Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Customer Name <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
                                <input
                                    type="text"
                                    value={formData.customer.name}
                                    onChange={(e) => handleCustomerChange('name', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Phone Number <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
                                <input
                                    type="tel"
                                    value={formData.customer.phone}
                                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Address <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-5 h-5 text-dark-text-tertiary" />
                                <textarea
                                    value={formData.customer.address}
                                    onChange={(e) => handleCustomerChange('address', e.target.value)}
                                    rows={3}
                                    className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    placeholder="Enter complete address"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assignment Details Card */}
                <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-dark-text">Assignment Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Assign Technician
                            </label>
                            <select
                                value={formData.technicianId}
                                onChange={(e) => handleInputChange('technicianId', e.target.value)}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                            >
                                <option value="">No technician (assign later)</option>
                                {technicians.map((tech) => (
                                    <option key={tech._id} value={tech._id}>
                                        {tech.fullName} - {tech.email}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-dark-text-tertiary mt-2">
                                You can assign a technician now or later
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Initial Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                            >
                                <option value="pending">Pending</option>
                                <option value="assigned">Assigned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payment Information Card */}
                <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-dark-text">Payment Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Total Amount (₹) <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-tertiary">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    value={formData.paymentAmount}
                                    onChange={(e) =>
                                        handleInputChange('paymentAmount', Number(e.target.value))
                                    }
                                    className="w-full pl-8 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Amount Collected (₹)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-tertiary">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    value={formData.paymentAmountcollected}
                                    onChange={(e) =>
                                        handleInputChange('paymentAmountcollected', Number(e.target.value))
                                    }
                                    className="w-full pl-8 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Payment Status
                            </label>
                            <select
                                value={formData.paymentstatus}
                                onChange={(e) => handleInputChange('paymentstatus', e.target.value)}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="partially paid">Partially Paid</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Payment Mode
                            </label>
                            <select
                                value={formData.paymentMode}
                                onChange={(e) => handleInputChange('paymentMode', e.target.value)}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                            >
                                <option value="cash">Cash</option>
                                <option value="online">Online</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Payment Date
                                </div>
                            </label>
                            <input
                                type="date"
                                value={formData.paymentDate}
                                onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                            />
                            <p className="text-xs text-dark-text-tertiary mt-2">
                                Optional: Set the payment date if payment has been received
                            </p>
                        </div>

                        {/* Payment Summary */}
                        <div className="md:col-span-2 bg-dark-bg/50 rounded-lg p-4 border border-dark-border">
                            <h3 className="text-sm font-semibold text-dark-text mb-3">Payment Summary</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-dark-text-tertiary mb-1">Total Amount</p>
                                    <p className="text-lg font-bold text-dark-text">
                                        ₹{formData.paymentAmount}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-dark-text-tertiary mb-1">Collected</p>
                                    <p className="text-lg font-bold text-green-400">
                                        ₹{formData.paymentAmountcollected}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-dark-text-tertiary mb-1">Remaining</p>
                                    <p className="text-lg font-bold text-yellow-400">
                                        ₹{formData.paymentAmount - formData.paymentAmountcollected}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/assignments')}
                        className="px-6 py-3 bg-dark-bg border border-dark-border rounded-xl font-semibold text-dark-text hover:bg-dark-surface-hover transition-colors duration-200"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Create Assignment
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateAssignment;
