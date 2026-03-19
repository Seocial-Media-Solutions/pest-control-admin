import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ClipboardList,
    ArrowLeft,
    Save,
    User,
    Phone,
    Mail,
    MapPin,
    Loader2,
    Calendar
} from 'lucide-react';
import { createAssignment } from '../services/assignmentService';
import { getAllTechnicians } from '../services/technicianService';
import bookingService from '../services/bookingService';
import toast from 'react-hot-toast';

const CreateAssignment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [technicians, setTechnicians] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [formData, setFormData] = useState({
        bookingId: '',
        technicianId: '',
    });

    useEffect(() => {
        fetchTechnicians();
        fetchPendingBookings();
    }, []);

    // Handle initial state from navigation (e.g. from Bookings -> Assign Tech)
    useEffect(() => {
        if (location.state?.bookingId) {
            setFormData(prev => ({
                ...prev,
                bookingId: location.state.bookingId
            }));

            // If the bookings are loaded, check if the passed ID is in the list
            // If not (maybe it's not 'pending' anymore but we still want to assign),
            // we might want to fetch that specific booking to display it.
            // For now, we assume the list contains it or we just set the ID.
        }
    }, [location.state, bookings]); // Run when bookings load too to match

    const fetchTechnicians = async () => {
        try {
            const data = await getAllTechnicians();
            setTechnicians(data.data || []);
        } catch (err) {
            console.error('Error fetching technicians:', err);
            toast.error('Failed to load technicians');
        }
    };

    const fetchPendingBookings = async () => {
        try {
            // Fetch pending and confirmed bookings that might need assignment
            const response = await bookingService.getAllBookings({ status: 'pending' });
            // We could also fetch 'confirmed' if needed, but 'pending' is main queue
            setBookings(response.data.bookings || []);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            toast.error('Failed to load bookings');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const assignmentData = {
                bookingId: formData.bookingId,
                technicianId: formData.technicianId || null
            };

            const response = await createAssignment(assignmentData);
            toast.success('Assignment created successfully!');

            // Update booking status to 'in-progress' or 'confirmed' if needed?
            // Usually backend handles this, or we do a separate call.
            // For now, just create assignment.

            if (response.data._id) {
                navigate(`/assignments`);
                toast('You can now add treatment details', { icon: '📝' });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create assignment');
            console.error('Error creating assignment:', err);
        } finally {
            setLoading(false);
        }
    };

    // Find selected booking to show details
    const selectedBooking = bookings.find(b => b._id === formData.bookingId)
        || (location.state?.bookingData && location.state.bookingId === formData.bookingId ? location.state.bookingData : null);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/assignments')}
                        className="p-2 hover:bg-light-surface-hover rounded-lg transition-colors duration-200"
                    >
                        <ArrowLeft className="w-6 h-6 text-light-text" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-light-text mb-2">Create New Assignment</h1>
                        <p className="text-light-text-secondary">
                            Link a booking to a technician to start the service workflow
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Booking Selection Card */}
                <div className="bg-white border border-light-border rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-light-text">Booking Summary</h2>
                    </div>

                    <div className="space-y-4">
                       

                        {/* Show selected booking details */}
                        {selectedBooking && (
                            <div className="bg-light-bg/50 rounded-lg p-4 border border-light-border">
                                <h4 className="text-xs font-semibold text-light-text-tertiary mb-3">BOOKING SUMMARY</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-light-text">
                                            <User className="w-4 h-4 text-light-text-tertiary" />
                                            <span className="text-light-text-secondary">Customer:</span> {selectedBooking.customerId?.fullName}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-light-text">
                                            <Phone className="w-4 h-4 text-light-text-tertiary" />
                                            <span className="text-light-text-secondary">Mobile:</span> {selectedBooking.customerId?.mobileNo || selectedBooking.additionalMobileNo}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-light-text">
                                            <MapPin className="w-4 h-4 text-light-text-tertiary" />
                                            <span className="text-light-text-secondary">Address:</span> <span className="line-clamp-1">{selectedBooking.additionalAddress || selectedBooking.customerId?.address}</span>
                                        </div>
                                      
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Technician Selection Card */}
                <div className="bg-white border border-light-border rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-light-text">Assign Technician</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text mb-2">
                                Select Technician (Optional)
                            </label>
                            <select
                                value={formData.technicianId}
                                onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                                className="w-full px-4 py-3 bg-light-bg border border-light-border rounded-lg text-light-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                            >
                                <option value="">No technician (assign later)</option>
                                {technicians.map((tech) => (
                                    <option key={tech._id} value={tech._id}>
                                        {tech.fullName} - {tech.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/assignments')}
                        className="px-6 py-3 bg-light-bg border border-light-border rounded-xl font-semibold text-light-text hover:bg-light-surface-hover transition-colors duration-200"
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
