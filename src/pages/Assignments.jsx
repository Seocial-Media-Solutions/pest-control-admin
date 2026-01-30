import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Loader2,
    User,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Beaker,
    Camera,
    DollarSign,
    CheckCircle2,
    XCircle,
    Clock,
} from 'lucide-react';
import {
    getAllAssignments,
    deleteAssignment,
    assignTechnician,
    addTreatmentPreparation,
    updateTreatmentPreparation,
    deleteTreatmentPreparation,
    addSitePicture,
    deleteSitePicture,
    addPaymentCollection,
    updatePaymentCollection,
    deletePaymentCollection,
} from '../services/assignmentService';
import { getAllTechnicians } from '../services/technicianService';
import toast from 'react-hot-toast';

const Assignments = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    // Workflow modals
    const [showTreatmentModal, setShowTreatmentModal] = useState(false);
    const [showPictureModal, setShowPictureModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);



    // Form states
    const [treatmentForm, setTreatmentForm] = useState({
        chemicals: '',
        quantity: '',
        instructions: ''
    });

    const [pictureForm, setPictureForm] = useState({
        file: null
    });

    const [paymentForm, setPaymentForm] = useState({
        amount: 0,
        paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'pending'
    });

    useEffect(() => {
        fetchAssignments();
        fetchTechnicians();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const data = await getAllAssignments();
            setAssignments(data.data || []);
        } catch (err) {
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

    const handleDeleteAssignment = async (id) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await deleteAssignment(id);
                toast.success('Assignment deleted successfully');
                fetchAssignments();
            } catch (err) {
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

    // Treatment Preparation Handlers
    const handleAddTreatment = async (e) => {
        e.preventDefault();
        try {
            await addTreatmentPreparation(selectedAssignment._id, treatmentForm);
            toast.success('Treatment preparation added');
            setShowTreatmentModal(false);
            setTreatmentForm({ chemicals: '', quantity: '', instructions: '' });
            fetchAssignments();
        } catch (err) {
            toast.error('Failed to add treatment preparation');
        }
    };

    const handleDeleteTreatment = async (itemId) => {
        if (window.confirm('Delete this treatment item?')) {
            try {
                await deleteTreatmentPreparation(selectedAssignment._id, itemId);
                toast.success('Treatment item deleted');
                fetchAssignments();
            } catch (err) {
                toast.error('Failed to delete treatment item');
            }
        }
    };

    // Site Picture Handlers
    const handleAddPicture = async (e) => {
        e.preventDefault();
        if (!pictureForm.file) {
            toast.error('Please select an image');
            return;
        }

        const toastId = toast.loading('Uploading image...');

        try {
            const formData = new FormData();
            formData.append('image', pictureForm.file);

            await addSitePicture(selectedAssignment._id, formData);
            toast.success('Site picture added', { id: toastId });
            setShowPictureModal(false);
            setPictureForm({ file: null });
            fetchAssignments();
        } catch (err) {
            toast.error('Failed to add site picture', { id: toastId });
            console.error(err);
        }
    };

    const handleDeletePicture = async (pictureId) => {
        if (window.confirm('Delete this picture?')) {
            try {
                await deleteSitePicture(selectedAssignment._id, pictureId);
                toast.success('Picture deleted');
                fetchAssignments();
            } catch (err) {
                toast.error('Failed to delete picture');
            }
        }
    };

    // Payment Collection Handlers
    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            await addPaymentCollection(selectedAssignment._id, paymentForm);
            toast.success('Payment recorded');
            setShowPaymentModal(false);
            setPaymentForm({ amount: 0, paymentMethod: 'cash', paymentDate: new Date().toISOString().split('T')[0], paymentStatus: 'pending' });
            fetchAssignments();
        } catch (err) {
            toast.error('Failed to add payment');
        }
    };

    const handleDeletePayment = async (paymentId) => {
        if (window.confirm('Delete this payment record?')) {
            try {
                await deletePaymentCollection(selectedAssignment._id, paymentId);
                toast.success('Payment record deleted');
                fetchAssignments();
            } catch (err) {
                toast.error('Failed to delete payment');
            }
        }
    };



    const openDetailsModal = (assignment) => {
        setSelectedAssignment(assignment);
        setShowDetailsModal(true);
    };

    const filteredAssignments = assignments.filter((assignment) => {
        const customer = assignment.bookingId?.customerId;
        const customerName = customer?.fullName || '';
        const customerEmail = customer?.email || '';
        const customerPhone = customer?.mobileNumber || '';

        return (
            customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customerPhone.includes(searchTerm)
        );
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
                        Manage service assignments with 3-step workflow
                    </p>
                </div>
                <button
                    onClick={() => navigate('/assignments/create')}
                    className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                    <Plus className="w-5 h-5" />
                    New Assignment
                </button>
            </div>

            {/* Search */}
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search by customer name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-sm text-dark-text placeholder:text-dark-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                    />
                </div>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAssignments.map((assignment) => (
                    <div
                        key={assignment._id}
                        className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10"
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-dark-text mb-1">
                                        Assignment #{assignment._id.slice(-6)}
                                    </h3>
                                    <p className="text-xs text-dark-text-tertiary">
                                        {new Date(assignment.createdAt).toLocaleDateString()}
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
                                        onClick={() => handleDeleteAssignment(assignment._id)}
                                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors duration-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>



                            {/* Customer Info */}
                            {assignment.bookingId?.customerId && (
                                <div className="bg-dark-bg/50 rounded-lg p-4 mb-4">
                                    <h4 className="text-xs font-semibold text-dark-text-tertiary mb-2">CUSTOMER</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-dark-text">
                                            <User className="w-4 h-4 text-dark-text-tertiary" />
                                            {assignment.bookingId.customerId.fullName}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-dark-text">
                                            <Phone className="w-4 h-4 text-dark-text-tertiary" />
                                            {assignment.bookingId.customerId.mobileNumber}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-dark-text">
                                            <Mail className="w-4 h-4 text-dark-text-tertiary" />
                                            {assignment.bookingId.customerId.email}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Booking Details */}
                            {assignment.bookingId && (
                                <div className="bg-dark-bg/50 rounded-lg p-4 mb-4 border border-dark-border/50">
                                    <h4 className="text-xs font-semibold text-dark-text-tertiary mb-2">BOOKING DETAILS</h4>
                                    <div className="space-y-3">
                                        {/* Services */}
                                        <div className="flex flex-col gap-2">
                                            {assignment.bookingId.subServiceIds?.length > 0 ? (
                                                assignment.bookingId.subServiceIds.map((subItem, idx) => {
                                                    const service = subItem.serviceId || {};
                                                    return (
                                                        <div key={idx} className="flex items-center gap-2 p-2 bg-dark-bg/80 border border-dark-border/50 rounded-lg justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-10 h-10 rounded overflow-hidden bg-dark-bg flex-shrink-0 border border-dark-border/30">
                                                                    {service.metaImage ? (
                                                                        <img
                                                                            src={service.metaImage}
                                                                            alt={service.title}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-dark-surface">
                                                                            <Beaker className="w-4 h-4 text-dark-text-tertiary" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="text-sm font-medium text-dark-text">
                                                                    {service.title || 'Service'}
                                                                </span>
                                                            </div>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded capitalize ${subItem.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                                                                }`}>
                                                                {subItem.status || 'pending'}
                                                            </span>
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <span className="text-xs text-dark-text-secondary">No services listed</span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-xs text-dark-text-tertiary flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</p>
                                                <p className="text-sm text-dark-text">{new Date(assignment.bookingId.bookingDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-dark-text-tertiary flex items-center gap-1"><Clock className="w-3 h-3" /> Time</p>
                                                <p className="text-sm text-dark-text capitalize">{assignment.bookingId.preferredTimeSlot || 'Anytime'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs text-dark-text-tertiary flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</p>
                                            <p className="text-sm text-dark-text line-clamp-2" title={assignment.bookingId.additionalAddress || assignment.bookingId.customerId?.address}>
                                                {assignment.bookingId.additionalAddress || assignment.bookingId.customerId?.address || 'N/A'}
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-dark-border/50 flex justify-between items-center">
                                            <span className="text-xs text-dark-text-secondary">Total Amount</span>
                                            <span className="text-sm font-bold text-green-400">₹{assignment.bookingId.totalAmount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                <select
                                    onChange={(e) => handleAssignTechnician(assignment._id, e.target.value)}
                                    className="w-full px-3 py-2 mb-4 bg-dark-bg border border-dark-border rounded-lg text-xs text-dark-text focus:outline-none focus:border-primary-500 transition-all duration-200"
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

                            {/* Workflow Progress */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1 text-dark-text-secondary">
                                        <Beaker className="w-3 h-3" />
                                        Treatment Prep
                                    </span>
                                    <span className="text-primary-400 font-semibold">
                                        {assignment.treatmentPreparation?.length || 0} items
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1 text-dark-text-secondary">
                                        <Camera className="w-3 h-3" />
                                        Site Pictures
                                    </span>
                                    <span className="text-primary-400 font-semibold">
                                        {assignment.applyTreatment?.sitePictures?.length || 0} photos
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1 text-dark-text-secondary">
                                        <DollarSign className="w-3 h-3" />
                                        Payments
                                    </span>
                                    <span className="text-green-400 font-semibold">
                                        {assignment.paymentCollection?.length || 0} records
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/assignments/${assignment._id}/workflow`);
                                }}
                                className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-xs font-semibold text-dark-text hover:bg-dark-surface-hover hover:border-primary-500 transition-all"
                            >
                                <ClipboardList className="w-3 h-3" />
                                Test Workflow
                            </button>
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
                        {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first assignment'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => navigate('/assignments/create')}
                            className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200"
                        >
                            <Plus className="w-5 h-5" />
                            New Assignment
                        </button>
                    )}
                </div>
            )}

            {/* Details Modal - Showing workflow steps */}
            {showDetailsModal && selectedAssignment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowDetailsModal(false)}>
                    <div className="bg-dark-surface border border-dark-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-dark-border sticky top-0 bg-dark-surface z-10">
                            <h2 className="text-2xl font-bold text-dark-text">Assignment Details</h2>
                            <p className="text-sm text-dark-text-tertiary">ID: {selectedAssignment._id}</p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            {selectedAssignment.customer && (
                                <div>
                                    <h3 className="text-lg font-semibold text-dark-text mb-3">Customer Information</h3>
                                    <div className="bg-dark-bg/50 rounded-lg p-4 space-y-2">
                                        <p><span className="text-dark-text-tertiary">Name:</span> <span className="text-dark-text font-semibold">{selectedAssignment.customer.fullName}</span></p>
                                        <p><span className="text-dark-text-tertiary">Email:</span> <span className="text-dark-text">{selectedAssignment.customer.email}</span></p>
                                        <p><span className="text-dark-text-tertiary">Phone:</span> <span className="text-dark-text">{selectedAssignment.customer.mobileNumber}</span></p>
                                        <p><span className="text-dark-text-tertiary">Address:</span> <span className="text-dark-text">{selectedAssignment.customer.address}</span></p>
                                    </div>
                                </div>
                            )}

                            {/* Step 1: Treatment Preparation */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-dark-text flex items-center gap-2">
                                        <Beaker className="w-5 h-5 text-primary-400" />
                                        Step 1: Treatment Preparation
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowTreatmentModal(true);
                                            setShowDetailsModal(false);
                                        }}
                                        className="px-3 py-1.5 bg-primary-500/10 text-primary-400 rounded-lg text-sm font-semibold hover:bg-primary-500/20 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 inline mr-1" />
                                        Add Item
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {selectedAssignment.treatmentPreparation?.map((item) => (
                                        <div key={item._id} className="bg-dark-bg/50 rounded-lg p-4 border border-dark-border">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-dark-text">{item.chemicals}</h4>
                                                <button
                                                    onClick={() => handleDeleteTreatment(item._id)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-dark-text-secondary">Quantity: {item.quantity}</p>
                                            <p className="text-sm text-dark-text-secondary mt-1">{item.instructions}</p>
                                        </div>
                                    ))}
                                    {(!selectedAssignment.treatmentPreparation || selectedAssignment.treatmentPreparation.length === 0) && (
                                        <p className="text-dark-text-tertiary text-sm">No treatment items added yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Step 2: Apply Treatment (Site Pictures) */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-dark-text flex items-center gap-2">
                                        <Camera className="w-5 h-5 text-primary-400" />
                                        Step 2: Apply Treatment (Site Pictures)
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowPictureModal(true);
                                            setShowDetailsModal(false);
                                        }}
                                        className="px-3 py-1.5 bg-primary-500/10 text-primary-400 rounded-lg text-sm font-semibold hover:bg-primary-500/20 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 inline mr-1" />
                                        Add Picture
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {selectedAssignment.applyTreatment?.sitePictures?.map((pic) => (
                                        <div key={pic._id} className="relative group">
                                            <img
                                                src={pic.url}
                                                alt={pic.filename}
                                                className="w-full h-32 object-cover rounded-lg border border-dark-border"
                                            />
                                            <button
                                                onClick={() => handleDeletePicture(pic._id)}
                                                className="absolute top-2 right-2 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                            <p className="text-xs text-dark-text-tertiary mt-1 truncate">{pic.filename}</p>
                                        </div>
                                    ))}
                                    {(!selectedAssignment.applyTreatment?.sitePictures || selectedAssignment.applyTreatment.sitePictures.length === 0) && (
                                        <p className="text-dark-text-tertiary text-sm col-span-full">No pictures added yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Step 3: Payment Collection */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-dark-text flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-primary-400" />
                                        Step 3: Payment Collection
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowPaymentModal(true);
                                            setShowDetailsModal(false);
                                        }}
                                        className="px-3 py-1.5 bg-primary-500/10 text-primary-400 rounded-lg text-sm font-semibold hover:bg-primary-500/20 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 inline mr-1" />
                                        Add Payment
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {selectedAssignment.paymentCollection?.map((payment) => (
                                        <div key={payment._id} className="bg-dark-bg/50 rounded-lg p-4 border border-dark-border">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-dark-text text-lg">₹{payment.amount}</p>
                                                    <p className="text-sm text-dark-text-secondary">
                                                        {payment.paymentMethod.toUpperCase()} • {new Date(payment.paymentDate).toLocaleDateString()}
                                                    </p>
                                                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${payment.paymentStatus === 'completed' ? 'bg-green-500/10 text-green-400' :
                                                        payment.paymentStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                            'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {payment.paymentStatus.toUpperCase()}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeletePayment(payment._id)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedAssignment.paymentCollection || selectedAssignment.paymentCollection.length === 0) && (
                                        <p className="text-dark-text-tertiary text-sm">No payments recorded yet</p>
                                    )}
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

            {/* Treatment Preparation Modal */}
            {showTreatmentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTreatmentModal(false)}>
                    <div className="bg-dark-surface border border-dark-border rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-dark-border">
                            <h2 className="text-xl font-bold text-dark-text">Add Treatment Preparation</h2>
                        </div>
                        <form onSubmit={handleAddTreatment} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">Chemicals *</label>
                                <input
                                    type="text"
                                    value={treatmentForm.chemicals}
                                    onChange={(e) => setTreatmentForm({ ...treatmentForm, chemicals: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">Quantity *</label>
                                <input
                                    type="text"
                                    value={treatmentForm.quantity}
                                    onChange={(e) => setTreatmentForm({ ...treatmentForm, quantity: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">Instructions *</label>
                                <textarea
                                    value={treatmentForm.instructions}
                                    onChange={(e) => setTreatmentForm({ ...treatmentForm, instructions: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowTreatmentModal(false)}
                                    className="flex-1 px-6 py-3 bg-dark-bg border border-dark-border rounded-xl font-semibold text-dark-text hover:bg-dark-surface-hover transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    Add Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Site Picture Modal */}
            {showPictureModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPictureModal(false)}>
                    <div className="bg-dark-surface border border-dark-border rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-dark-border">
                            <h2 className="text-xl font-bold text-dark-text">Add Site Picture</h2>
                        </div>
                        <form onSubmit={handleAddPicture} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">Select Image *</label>
                                <div className="border-2 border-dashed border-dark-border rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setPictureForm({ file: e.target.files[0] })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required
                                    />
                                    <div className="flex flex-col items-center">
                                        <Camera className="w-8 h-8 text-dark-text-tertiary mb-2" />
                                        <p className="text-sm text-dark-text-secondary">
                                            {pictureForm.file ? pictureForm.file.name : 'Click or drag to upload image'}
                                        </p>
                                        <p className="text-xs text-dark-text-tertiary mt-1">
                                            Supports: JPG, PNG, WEBP
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPictureModal(false)}
                                    className="flex-1 px-6 py-3 bg-dark-bg border border-dark-border rounded-xl font-semibold text-dark-text hover:bg-dark-surface-hover transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    Add Picture
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Collection Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPaymentModal(false)}>
                    <div className="bg-dark-surface border border-dark-border rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-dark-border">
                            <h2 className="text-xl font-bold text-dark-text">Add Payment Record</h2>
                        </div>
                        <form onSubmit={handleAddPayment} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">Amount (₹) *</label>
                                <input
                                    type="number"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500"
                                    required
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">Payment Method *</label>
                                <select
                                    value={paymentForm.paymentMethod}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="upi">UPI</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">Payment Date *</label>
                                <input
                                    type="date"
                                    value={paymentForm.paymentDate}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">Payment Status *</label>
                                <select
                                    value={paymentForm.paymentStatus}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentStatus: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-primary-500"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-6 py-3 bg-dark-bg border border-dark-border rounded-xl font-semibold text-dark-text hover:bg-dark-surface-hover transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    Add Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

export default Assignments;
