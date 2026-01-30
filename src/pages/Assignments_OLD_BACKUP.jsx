import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Loader2,
    User,
    DollarSign,
    Calendar,
    MapPin,
    Phone,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
} from 'lucide-react';
import {
    getAllAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    assignTechnician,
    updateAssignmentStatus,
    updatePaymentStatus,
} from '../services/assignmentService';
import { getAllTechnicians } from '../services/technicianService';
import toast from 'react-hot-toast';

const Assignments = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
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
        serviceSteps: '',
        paymentstatus: 'pending',
        paymentAmount: 0,
        paymentAmountcollected: 0,
        paymentMode: 'cash',
        paymentDate: '',
        status: 'pending',
    });

    // Fetch assignments and technicians on component mount
    useEffect(() => {
        fetchAssignments();
        fetchTechnicians();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const data = await getAllAssignments();
            setAssignments(data.data || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch assignments');
            toast.error('Failed to fetch assignments');
            console.error('Error fetching assignments:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const data = await getAllTechnicians();
            setTechnicians(data.data || []);
        } catch (err) {
            console.error('Error fetching technicians:', err);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            const assignmentData = {
                ...formData,
                serviceSteps: formData.serviceSteps ? formData.serviceSteps.split(',').map(step => step.trim()) : [],
                technicianId: formData.technicianId || null,
                paymentDate: formData.paymentDate || null,
            };

            if (selectedAssignment) {
                await updateAssignment(selectedAssignment._id, assignmentData);
                toast.success('Assignment updated successfully');
            } else {
                await createAssignment(assignmentData);
                toast.success('Assignment created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchAssignments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save assignment');
            toast.error(err.response?.data?.message || 'Failed to save assignment');
            console.error('Error saving assignment:', err);
        }
    };

    const handleDeleteAssignment = async (id) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await deleteAssignment(id);
                toast.success('Assignment deleted successfully');
                fetchAssignments();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete assignment');
                toast.error('Failed to delete assignment');
                console.error('Error deleting assignment:', err);
            }
        }
    };

    const handleAssignTechnician = async (assignmentId, technicianId) => {
        try {
            await assignTechnician(assignmentId, technicianId);
            toast.success('Technician assigned successfully');
            fetchAssignments();
        } catch (err) {
            toast.error('Failed to assign technician');
            console.error('Error assigning technician:', err);
        }
    };

    const handleStatusUpdate = async (assignmentId, status) => {
        try {
            await updateAssignmentStatus(assignmentId, status);
            toast.success('Status updated successfully');
            fetchAssignments();
        } catch (err) {
            toast.error('Failed to update status');
            console.error('Error updating status:', err);
        }
    };

    const handlePaymentUpdate = async (assignmentId, paymentData) => {
        try {
            await updatePaymentStatus(assignmentId, paymentData);
            toast.success('Payment updated successfully');
            fetchAssignments();
        } catch (err) {
            toast.error('Failed to update payment');
            console.error('Error updating payment:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            serviceTitle: '',
            serviceType: '',
            serviceDescription: '',
            customer: {
                name: '',
                phone: '',
                address: '',
            },
            technicianId: '',
            serviceSteps: '',
            paymentstatus: 'pending',
            paymentAmount: 0,
            paymentAmountcollected: 0,
            paymentMode: 'cash',
            paymentDate: '',
            status: 'pending',
        });
        setSelectedAssignment(null);
    };

    const openEditModal = (assignment) => {
        setSelectedAssignment(assignment);
        setFormData({
            serviceTitle: assignment.serviceTitle,
            serviceType: assignment.serviceType,
            serviceDescription: assignment.serviceDescription,
            customer: assignment.customer,
            technicianId: assignment.technicianId?._id || '',
            serviceSteps: assignment.serviceSteps?.join(', ') || '',
            paymentstatus: assignment.paymentstatus,
            paymentAmount: assignment.paymentAmount,
            paymentAmountcollected: assignment.paymentAmountcollected,
            paymentMode: assignment.paymentMode,
            paymentDate: assignment.paymentDate ? new Date(assignment.paymentDate).toISOString().split('T')[0] : '',
            status: assignment.status,
        });
        setShowModal(true);
    };

    const openDetailsModal = (assignment) => {
        setSelectedAssignment(assignment);
        setShowDetailsModal(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
            assigned: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: User },
            in_progress: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: AlertCircle },
            completed: { color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle },
            cancelled: { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
        };
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border ${config.color}`}>
                <Icon className="w-3 h-3" />
                {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const getPaymentBadge = (paymentstatus) => {
        const paymentConfig = {
            pending: { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
            paid: { color: 'bg-green-500/10 text-green-400 border-green-500/20' },
            'partially paid': { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
            cancelled: { color: 'bg-red-500/10 text-red-400 border-red-500/20' },
        };
        const config = paymentConfig[paymentstatus] || paymentConfig.pending;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border ${config.color}`}>
                <DollarSign className="w-3 h-3" />
                {paymentstatus.toUpperCase()}
            </span>
        );
    };

    const filteredAssignments = assignments.filter((assignment) => {
        const matchesSearch =
            assignment.serviceTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.customer?.phone?.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
        const matchesPayment = paymentFilter === 'all' || assignment.paymentstatus === paymentFilter;
        return matchesSearch && matchesStatus && matchesPayment;
    });

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
                    <h1 className="text-3xl font-bold text-dark-text mb-2">Assignments</h1>
                    <p className="text-dark-text-secondary">
                        Manage service assignments and track their progress
                    </p>
                </div>
                <button
                    onClick={() => navigate('/assignments/create')}
                    className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                    <Plus className="w-5 h-5" />
                    Add Assignment
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
                    {error}
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
                        <input
                            type="text"
                            placeholder="Search by service, customer name, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-sm text-dark-text placeholder:text-dark-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-sm text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-sm text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                    >
                        <option value="all">All Payments</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="partially paid">Partially Paid</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAssignments.map((assignment) => (
                    <div
                        key={assignment._id}
                        className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10"
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-dark-text mb-1">
                                        {assignment.serviceTitle}
                                    </h3>
                                    <p className="text-sm text-dark-text-secondary">
                                        {assignment.serviceType}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openDetailsModal(assignment)}
                                        className="p-2 bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 transition-colors duration-200"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => openEditModal(assignment)}
                                        className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors duration-200"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAssignment(assignment._id)}
                                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors duration-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-dark-bg/50 rounded-lg p-4 mb-4">
                                <h4 className="text-xs font-semibold text-dark-text-tertiary mb-2">CUSTOMER</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-dark-text">
                                        <User className="w-4 h-4 text-dark-text-tertiary" />
                                        {assignment.customer?.name}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-dark-text">
                                        <Phone className="w-4 h-4 text-dark-text-tertiary" />
                                        {assignment.customer?.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-dark-text">
                                        <MapPin className="w-4 h-4 text-dark-text-tertiary" />
                                        {assignment.customer?.address}
                                    </div>
                                </div>
                            </div>

                            {/* Status and Payment */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {getStatusBadge(assignment.status)}
                                {getPaymentBadge(assignment.paymentstatus)}
                            </div>

                            {/* Technician */}
                            {assignment.technicianId ? (
                                <div className="bg-accent-500/10 rounded-lg p-3 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-accent-400">
                                        <User className="w-4 h-4" />
                                        <span className="font-semibold">Assigned to:</span>
                                        {assignment.technicianId.fullName}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-500/10 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-yellow-400">No technician assigned</p>
                                </div>
                            )}

                            {/* Payment Info */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-dark-text-tertiary mb-1">Total Amount</p>
                                    <p className="text-lg font-bold text-dark-text">
                                        ₹{assignment.paymentAmount}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-dark-text-tertiary mb-1">Collected</p>
                                    <p className="text-lg font-bold text-green-400">
                                        ₹{assignment.paymentAmountcollected}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <select
                                    value={assignment.status}
                                    onChange={(e) => handleStatusUpdate(assignment._id, e.target.value)}
                                    className="flex-1 px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-xs text-dark-text focus:outline-none focus:border-primary-500 transition-all duration-200"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {!assignment.technicianId && (
                                    <select
                                        onChange={(e) => handleAssignTechnician(assignment._id, e.target.value)}
                                        className="flex-1 px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-xs text-dark-text focus:outline-none focus:border-primary-500 transition-all duration-200"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Assign Technician</option>
                                        {technicians.map((tech) => (
                                            <option key={tech._id} value={tech._id}>
                                                {tech.fullName}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredAssignments.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
                    <ClipboardList className="w-16 h-16 text-dark-text-tertiary mb-4" />
                    <h3 className="text-xl font-bold text-dark-text mb-2">
                        No assignments found
                    </h3>
                    <p className="text-dark-text-secondary mb-6">
                        {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Get started by creating your first assignment'}
                    </p>
                    {!searchTerm && statusFilter === 'all' && paymentFilter === 'all' && (
                        <button
                            onClick={() => navigate('/assignments/create')}
                            className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200"
                        >
                            <Plus className="w-5 h-5" />
                            Add Assignment
                        </button>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-dark-surface border border-dark-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-dark-border">
                            <h2 className="text-2xl font-bold text-dark-text">
                                {selectedAssignment ? 'Edit Assignment' : 'Add New Assignment'}
                            </h2>
                        </div>

                        <form onSubmit={handleCreateAssignment} className="p-6 space-y-6">
                            {/* Service Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-dark-text mb-4">Service Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Service Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.serviceTitle}
                                            onChange={(e) =>
                                                setFormData({ ...formData, serviceTitle: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Service Type *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.serviceType}
                                            onChange={(e) =>
                                                setFormData({ ...formData, serviceType: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-dark-text mb-2">
                                        Service Description *
                                    </label>
                                    <textarea
                                        value={formData.serviceDescription}
                                        onChange={(e) =>
                                            setFormData({ ...formData, serviceDescription: e.target.value })
                                        }
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                        required
                                    />
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-dark-text mb-2">
                                        Service Steps (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.serviceSteps}
                                        onChange={(e) =>
                                            setFormData({ ...formData, serviceSteps: e.target.value })
                                        }
                                        placeholder="Inspection, Treatment, Follow-up"
                                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                    />
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-dark-text mb-4">Customer Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Customer Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.customer.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    customer: { ...formData.customer, name: e.target.value },
                                                })
                                            }
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.customer.phone}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    customer: { ...formData.customer, phone: e.target.value },
                                                })
                                            }
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-dark-text mb-2">
                                        Address *
                                    </label>
                                    <textarea
                                        value={formData.customer.address}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                customer: { ...formData.customer, address: e.target.value },
                                            })
                                        }
                                        rows={2}
                                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Assignment Details */}
                            <div>
                                <h3 className="text-lg font-semibold text-dark-text mb-4">Assignment Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Assign Technician
                                        </label>
                                        <select
                                            value={formData.technicianId}
                                            onChange={(e) =>
                                                setFormData({ ...formData, technicianId: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                        >
                                            <option value="">No technician</option>
                                            {technicians.map((tech) => (
                                                <option key={tech._id} value={tech._id}>
                                                    {tech.fullName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) =>
                                                setFormData({ ...formData, status: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
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

                            {/* Payment Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-dark-text mb-4">Payment Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Total Amount (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.paymentAmount}
                                            onChange={(e) =>
                                                setFormData({ ...formData, paymentAmount: Number(e.target.value) })
                                            }
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Amount Collected (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.paymentAmountcollected}
                                            onChange={(e) =>
                                                setFormData({ ...formData, paymentAmountcollected: Number(e.target.value) })
                                            }
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Payment Status
                                        </label>
                                        <select
                                            value={formData.paymentstatus}
                                            onChange={(e) =>
                                                setFormData({ ...formData, paymentstatus: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
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
                                            onChange={(e) =>
                                                setFormData({ ...formData, paymentMode: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="online">Online</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-text mb-2">
                                            Payment Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.paymentDate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, paymentDate: e.target.value })
                                            }
                                            className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                                        />
                                    </div>
                                </div>
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
                                    {selectedAssignment ? 'Update Assignment' : 'Create Assignment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedAssignment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-dark-surface border border-dark-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-dark-border">
                            <h2 className="text-2xl font-bold text-dark-text">Assignment Details</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Service Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-dark-text mb-3">Service Information</h3>
                                <div className="bg-dark-bg/50 rounded-lg p-4 space-y-2">
                                    <div>
                                        <span className="text-sm text-dark-text-tertiary">Title:</span>
                                        <p className="text-dark-text font-semibold">{selectedAssignment.serviceTitle}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-dark-text-tertiary">Type:</span>
                                        <p className="text-dark-text">{selectedAssignment.serviceType}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-dark-text-tertiary">Description:</span>
                                        <p className="text-dark-text">{selectedAssignment.serviceDescription}</p>
                                    </div>
                                    {selectedAssignment.serviceSteps && selectedAssignment.serviceSteps.length > 0 && (
                                        <div>
                                            <span className="text-sm text-dark-text-tertiary">Steps:</span>
                                            <ul className="list-disc list-inside text-dark-text">
                                                {selectedAssignment.serviceSteps.map((step, index) => (
                                                    <li key={index}>{step}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-dark-text mb-3">Customer Information</h3>
                                <div className="bg-dark-bg/50 rounded-lg p-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-dark-text-tertiary" />
                                        <span className="text-dark-text">{selectedAssignment.customer?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-dark-text-tertiary" />
                                        <span className="text-dark-text">{selectedAssignment.customer?.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-dark-text-tertiary" />
                                        <span className="text-dark-text">{selectedAssignment.customer?.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <h3 className="text-lg font-semibold text-dark-text mb-3">Status</h3>
                                <div className="flex gap-2">
                                    {getStatusBadge(selectedAssignment.status)}
                                    {getPaymentBadge(selectedAssignment.paymentstatus)}
                                </div>
                            </div>

                            {/* Technician */}
                            {selectedAssignment.technicianId && (
                                <div>
                                    <h3 className="text-lg font-semibold text-dark-text mb-3">Assigned Technician</h3>
                                    <div className="bg-accent-500/10 rounded-lg p-4">
                                        <p className="text-accent-400 font-semibold">{selectedAssignment.technicianId.fullName}</p>
                                        <p className="text-sm text-dark-text-secondary">{selectedAssignment.technicianId.email}</p>
                                        <p className="text-sm text-dark-text-secondary">{selectedAssignment.technicianId.contactNumber}</p>
                                    </div>
                                </div>
                            )}

                            {/* Payment Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-dark-text mb-3">Payment Information</h3>
                                <div className="bg-dark-bg/50 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-dark-text-tertiary">Total Amount:</span>
                                        <span className="text-dark-text font-bold">₹{selectedAssignment.paymentAmount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-dark-text-tertiary">Amount Collected:</span>
                                        <span className="text-green-400 font-bold">₹{selectedAssignment.paymentAmountcollected}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-dark-text-tertiary">Remaining:</span>
                                        <span className="text-yellow-400 font-bold">
                                            ₹{selectedAssignment.paymentAmount - selectedAssignment.paymentAmountcollected}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-dark-text-tertiary">Payment Mode:</span>
                                        <span className="text-dark-text capitalize">{selectedAssignment.paymentMode}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div>
                                <h3 className="text-lg font-semibold text-dark-text mb-3">Timeline</h3>
                                <div className="bg-dark-bg/50 rounded-lg p-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-dark-text-tertiary" />
                                        <span className="text-sm text-dark-text-tertiary">Created:</span>
                                        <span className="text-dark-text">
                                            {new Date(selectedAssignment.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-dark-text-tertiary" />
                                        <span className="text-sm text-dark-text-tertiary">Last Updated:</span>
                                        <span className="text-dark-text">
                                            {new Date(selectedAssignment.updatedAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-dark-border">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="w-full px-6 py-3 bg-dark-bg border border-dark-border rounded-xl font-semibold text-dark-text hover:bg-dark-surface-hover transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;
