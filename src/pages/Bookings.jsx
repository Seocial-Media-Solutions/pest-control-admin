import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Plus,
    Search,
    Edit2,
    Trash2,
    RefreshCw,
    User,
    Wrench,
    MapPin,
    Phone,
    Eye,
    Clock,
    XCircle,
    CheckCircle2,
    Briefcase
} from 'lucide-react';
import bookingService from '../services/bookingService';
import { toast } from 'react-hot-toast';

import { useSearch } from '../context/SearchContext';

const Bookings = () => {
    const navigate = useNavigate();
    const { searchQuery, setSearchQuery } = useSearch();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    // Removed local searchTerm

    // Fetch bookings
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;

            const response = await bookingService.getAllBookings(params);
            setBookings(response.data.bookings || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [searchQuery]);

    // Reject booking
    const handleRejectBooking = async (id) => {
        if (window.confirm('Are you sure you want to reject this booking? This will set the status to cancelled.')) {
            try {
                await bookingService.updateBooking(id, { status: 'cancelled' });
                toast.success('Booking rejected successfully');
                fetchBookings();
            } catch (error) {
                console.error('Error rejecting booking:', error);
                toast.error('Failed to reject booking');
            }
        }
    };

    // Assign to Technician (Navigate to Create Assignment with booking data)
    const handleAssignToTechnician = (booking) => {
        navigate('/assignments/create', {
            state: {
                bookingId: booking._id,
                customerId: booking.customerId?._id,
                customerName: booking.customerId?.fullName,
                bookingData: booking
            }
        });
    };

    // Delete booking
    const handleDeleteBooking = async (id) => {
        if (window.confirm('Are you sure you want to delete this booking history?')) {
            try {
                await bookingService.deleteBooking(id);
                toast.success('Booking deleted successfully');
                fetchBookings();
            } catch (error) {
                console.error('Error deleting booking:', error);
                toast.error('Failed to delete booking');
            }
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'in-progress': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            completed: 'bg-green-500/10 text-green-400 border-green-500/20',
            cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-dark-text mb-2">Bookings</h1>
                    <p className="text-dark-text-secondary">
                        Manage customer bookings and assign technicians
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchBookings}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg hover:border-primary-500 transition-all duration-300 text-dark-text"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                    <button
                        onClick={() => navigate('/bookings/create')}
                        className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <Plus className="w-5 h-5" />
                        New Booking
                    </button>
                </div>
            </div>


            {/* Bookings List Card View */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-dark-surface border border-dark-border rounded-2xl">
                        <Calendar className="w-16 h-16 text-dark-text-tertiary mb-4" />
                        <p className="text-dark-text-secondary">No bookings found</p>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking._id} className="bg-dark-surface border border-dark-border rounded-2xl p-6 hover:border-primary-500/50 transition-all duration-200 shadow-md shadow-black/20">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">


                                {/* Service Image & Info (Col 1-4) */}
                                <div className="lg:col-span-4 flex flex-col justify-between">
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        <h3 className="text-xs font-semibold text-dark-text-secondary uppercase tracking-wider mb-2">Selected Services ({booking.subServiceIds?.length || 0})</h3>
                                        {booking.subServiceIds?.length > 0 ? (
                                            booking.subServiceIds.map((subItem, idx) => {
                                                const sub = subItem.serviceId || {}; // Handle potential missing population
                                                return (
                                                    <div key={`${sub._id || idx}`} className="flex items-center gap-3 p-2 rounded-lg bg-dark-bg/50 border border-dark-border/50 hover:border-primary-500/30 transition-colors">
                                                        <div className="w-10 h-10 rounded-md overflow-hidden bg-dark-bg flex-shrink-0 border border-dark-border">
                                                            {sub.metaImage ? (
                                                                <img
                                                                    src={sub.metaImage}
                                                                    alt={sub.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Briefcase className="w-4 h-4 text-dark-text-tertiary" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-dark-text truncate" title={sub.title}>{sub.title || 'Unknown Service'}</p>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs text-dark-text-secondary">₹{sub.startingPrice || 0}</p>
                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${subItem.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                                                                    }`}>
                                                                    {subItem.status || 'pending'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="flex items-center gap-3 p-2 rounded-lg bg-dark-bg/50 border border-dark-border/50 border-dashed">
                                                <div className="w-10 h-10 rounded bg-dark-surface flex items-center justify-center">
                                                    <Briefcase className="w-4 h-4 text-dark-text-tertiary" />
                                                </div>
                                                <p className="text-sm text-dark-text-secondary">No Services Selected</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-dark-border flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-dark-text-secondary">Total Amount</p>
                                            <p className="text-lg font-bold text-primary-400">₹{booking.totalAmount?.toLocaleString() || 0}</p>
                                        </div>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(booking.status)}`}>
                                            {booking.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Customer & Address (Col 5-8) */}
                                <div className="lg:col-span-4 border-t pt-6 lg:border-t-0 lg:pt-0 lg:border-l border-dark-border lg:pl-6 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-primary-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-dark-text">
                                                {booking.customerId?.fullName || 'Unknown Customer'}
                                            </p>
                                            <p className="text-xs text-dark-text-secondary">
                                                {booking.customerId?.email}
                                            </p>
                                            <p className="text-xs text-dark-text-secondary">
                                                {booking.customerId?.mobileNo}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-primary-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-dark-text">
                                                {booking.additionalAddress || booking.customerId?.address || 'No address provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Dates & Actions (Col 9-12) */}
                                <div className="lg:col-span-4 border-t pt-6 lg:border-t-0 lg:pt-0 lg:border-l border-dark-border lg:pl-6 flex flex-col justify-between">
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-dark-text-tertiary flex items-center gap-2">
                                                <Calendar className="w-4 h-4" /> Booked On:
                                            </span>
                                            <span className="text-dark-text font-medium">
                                                {formatDate(booking.bookingDate)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-dark-text-tertiary flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-orange-400" /> Deadline:
                                            </span>
                                            <span className="text-orange-400 font-medium">
                                                {formatDate(booking.deadlineDate)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {booking.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleRejectBooking(booking._id)}
                                                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleAssignToTechnician(booking)}
                                                    className="px-4 py-2 rounded-lg gradient-primary text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Assign Tech
                                                </button>
                                            </>

                                        )}
                                        {booking.status !== 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => navigate(`/assignments`)}
                                                    className="col-span-2 px-4 py-2 rounded-lg bg-dark-bg border border-dark-border text-dark-text-secondary hover:text-dark-text text-sm font-semibold transition-colors"
                                                >
                                                    View Assignments
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Bookings;
