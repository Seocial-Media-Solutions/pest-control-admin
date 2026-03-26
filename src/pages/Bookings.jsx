import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, Plus, Edit2, Trash2, RefreshCw,
    User, MapPin, Clock, XCircle, CheckCircle2, Briefcase,
} from 'lucide-react';
import bookingService from '../services/bookingService';
import { toast } from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';

const Bookings = () => {
    const navigate = useNavigate();
    const { searchQuery } = useSearch();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;
            const response = await bookingService.getAllBookings(params);
            setBookings(response.data.bookings || []);
        } catch {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const handleRejectBooking = async (id) => {
        if (window.confirm('Reject this booking? Status will be set to cancelled.')) {
            try {
                await bookingService.updateBooking(id, { status: 'cancelled' });
                toast.success('Booking rejected'); fetchBookings();
            } catch { toast.error('Failed to reject booking'); }
        }
    };

    const handleAssignToTechnician = (booking) => {
        navigate('/assignments/create', {
            state: { bookingId: booking._id, customerId: booking.customerId?._id, customerName: booking.customerId?.fullName, bookingData: booking },
        });
    };

    const handleDeleteBooking = async (id) => {
        if (window.confirm('Delete this booking history?')) {
            try { await bookingService.deleteBooking(id); toast.success('Booking deleted'); fetchBookings(); }
            catch { toast.error('Failed to delete booking'); }
        }
    };

    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'N/A';

    const getStatusBadge = (status) => ({
        pending: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
        confirmed: 'bg-[#dbeafe] text-[#1d4ed8] border-[#bfdbfe]',
        'in-progress': 'bg-[#ede9fe] text-[#5b21b6] border-[#ddd6fe]',
        completed: 'bg-[#d4edbe] text-[#2e4d1b] border-[#a0d073]',
        cancelled: 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]',
    }[status] || 'bg-gray-100 text-gray-500 border-gray-200');

    return (
        <div className="space-y-6 animate-fade-in">
            <style>{`
                .bk-card { background:#fff; border:1px solid #d4edbe; border-radius:1rem; transition:border-color .25s,box-shadow .25s; }
                .bk-card:hover { border-color:#79bd4b; box-shadow:0 6px 24px rgba(121,189,75,.1); }
                .btn-g { background:linear-gradient(135deg,#79bd4b,#4e8230); color:#fff; border-radius:.75rem; font-weight:600; transition:all .2s; }
                .btn-g:hover { box-shadow:0 6px 20px rgba(121,189,75,.35); transform:translateY(-1px); }
            `}</style>

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2e4d1b]">Bookings</h1>
                    <p className="text-sm text-[#4e8230] mt-1">Manage customer bookings and assign technicians</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#d4edbe] hover:border-[#79bd4b] rounded-lg text-[#2e4d1b] font-medium text-sm transition-all">
                        <RefreshCw className="w-4 h-4 text-[#79bd4b]" /> Refresh
                    </button>
                    <button onClick={() => navigate('/bookings/create')} className="btn-g flex items-center gap-2 px-5 py-2.5">
                        <Plus className="w-4 h-4" /> New Booking
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-14">
                        <div className="w-10 h-10 rounded-full border-4 border-[#d4edbe] border-t-[#79bd4b] animate-spin" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 bk-card">
                        <Calendar className="w-14 h-14 text-[#a0d073] mb-3" />
                        <p className="text-[#4e8230]">No bookings found</p>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking._id} className="bk-card p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                {/* Services (col 1-4) */}
                                <div className="lg:col-span-4 flex flex-col justify-between">
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                        <h3 className="text-[10px] font-bold text-[#7aac52] uppercase tracking-wider mb-2">
                                            Selected Services ({booking.subServiceIds?.length || 0})
                                        </h3>
                                        {booking.subServiceIds?.length > 0 ? booking.subServiceIds.map((subItem, idx) => {
                                            const sub = subItem.serviceId || {};
                                            return (
                                                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-[#f6faf1] border border-[#d4edbe] hover:border-[#79bd4b] transition-colors">
                                                    <div className="w-9 h-9 rounded-md overflow-hidden bg-white border border-[#d4edbe] flex-shrink-0">
                                                        {sub.image
                                                            ? <img src={sub.image} alt={sub.title} className="w-full h-full object-cover" />
                                                            : <div className="w-full h-full flex items-center justify-center"><Briefcase className="w-4 h-4 text-[#a0d073]" /></div>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-[#1a2e0e] truncate">{sub.title || 'Unknown'}</p>
                                                        <div className="flex items-center justify-between mt-0.5">
                                                            <p className="text-[10px] text-[#4e8230]">₹{sub.startingPrice || 0}</p>
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded capitalize ${subItem.status === 'completed' ? 'bg-[#d4edbe] text-[#2e4d1b]' : 'bg-[#fef3c7] text-[#92400e]'}`}>
                                                                {subItem.status || 'pending'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <div className="flex items-center gap-3 p-2 rounded-lg bg-[#f6faf1] border border-dashed border-[#d4edbe]">
                                                <Briefcase className="w-4 h-4 text-[#a0d073]" />
                                                <p className="text-xs text-[#7aac52]">No Services Selected</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-[#d4edbe] flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-[#7aac52]">Total Amount</p>
                                            <p className="text-lg font-extrabold text-[#4e8230]">₹{booking.totalAmount?.toLocaleString() || 0}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${
                                                booking.plan === 'amc' ? 'bg-[#ede9fe] text-[#5b21b6] border-[#ddd6fe]' :
                                                booking.plan === 'quarterly' ? 'bg-[#dbeafe] text-[#1d4ed8] border-[#bfdbfe]' :
                                                booking.plan === 'monthly' ? 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]' :
                                                'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]'
                                            }`}>
                                                {booking.plan || 'SINGLE'} PLAN
                                            </span>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(booking.status)}`}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer (col 5-8) */}
                                <div className="lg:col-span-4 border-t pt-6 lg:border-t-0 lg:pt-0 lg:border-l border-[#d4edbe] lg:pl-6 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                            style={{ background: 'linear-gradient(135deg,#79bd4b,#4e8230)' }}>
                                            {(booking.customerId?.fullName || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#1a2e0e]">{booking.customerId?.fullName || 'Unknown'}</p>
                                            <p className="text-xs text-[#4e8230]">{booking.customerId?.email}</p>
                                            <p className="text-xs text-[#7aac52]">{booking.customerId?.mobileNo}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-[#79bd4b] mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-[#1a2e0e]">{booking.additionalAddress || booking.customerId?.address || 'No address provided'}</p>
                                    </div>
                                </div>

                                {/* Dates & Actions (col 9-12) */}
                                <div className="lg:col-span-4 border-t pt-6 lg:border-t-0 lg:pt-0 lg:border-l border-[#d4edbe] lg:pl-6 flex flex-col justify-between">
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[#7aac52] flex items-center gap-2"><Calendar className="w-4 h-4" />Booked On</span>
                                            <span className="text-[#1a2e0e] font-medium text-xs">{formatDate(booking.bookingDate)}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[#7aac52] flex items-center gap-2"><Clock className="w-4 h-4 text-[#f0a830]" />Deadline</span>
                                            <span className="text-[#f0a830] font-semibold text-xs">{formatDate(booking.deadlineDate)}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="grid grid-cols-2 gap-3">
                                            {booking.status === 'pending' ? (
                                                <>
                                                    <button onClick={() => handleRejectBooking(booking._id)}
                                                        className="px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 text-xs font-semibold transition-colors flex items-center justify-center gap-2">
                                                        <XCircle className="w-4 h-4" /> Reject
                                                    </button>
                                                    <button onClick={() => handleAssignToTechnician(booking)}
                                                        className="btn-g px-4 py-2 text-xs flex items-center justify-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4" /> Assign Tech
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => navigate('/assignments')}
                                                        className="col-span-1 px-4 py-2 rounded-lg bg-[#f6faf1] border border-[#d4edbe] hover:border-[#79bd4b] text-[#2e4d1b] text-xs font-semibold transition-colors flex items-center justify-center">
                                                        View
                                                    </button>
                                                    <button onClick={() => handleAssignToTechnician(booking)}
                                                        className="col-span-1 btn-g px-4 py-2 text-xs flex items-center justify-center gap-1.5">
                                                        <RefreshCw className="w-3.5 h-3.5" /> Reassign
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteBooking(booking._id)}
                                            className="w-full py-2 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:border-red-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete Booking Record
                                        </button>
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