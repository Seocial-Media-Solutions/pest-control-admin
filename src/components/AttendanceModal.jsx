import { useState, useEffect, useCallback } from 'react';
import {
    Calendar,
    CheckCircle,
    XCircle,
    TrendingUp,
    Clock,
    X,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import { markAttendance, getAttendanceByMonth } from '../services/technicianService';

const AttendanceModal = ({ technician, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [attendanceData, setAttendanceData] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear] = useState(new Date().getFullYear());
    const [markingAttendance, setMarkingAttendance] = useState(false);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const fetchAttendance = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAttendanceByMonth(technician._id, selectedMonth);
            setAttendanceData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch attendance');
            console.error('Error fetching attendance:', err);
        } finally {
            setLoading(false);
        }
    }, [technician?._id, selectedMonth]);

    useEffect(() => {
        if (technician) {
            fetchAttendance();
        }
    }, [technician, fetchAttendance]);

    const handleMarkAttendance = async (status) => {
        try {
            setMarkingAttendance(true);
            setError(null);
            setSuccess(null);

            await markAttendance(technician._id, {
                status,
                date: new Date().toISOString()
            });

            setSuccess(`Attendance marked as ${status}`);

            // Refresh attendance data
            setTimeout(() => {
                fetchAttendance();
                setSuccess(null);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark attendance');
            console.error('Error marking attendance:', err);
        } finally {
            setMarkingAttendance(false);
        }
    };

    const handlePreviousMonth = () => {
        if (selectedMonth > 1) {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const handleNextMonth = () => {
        const currentMonth = new Date().getMonth() + 1;
        if (selectedMonth < currentMonth) {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const isCurrentMonth = selectedMonth === new Date().getMonth() + 1;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white border border-light-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-light-border flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-light-text mb-1">
                            Attendance Management
                        </h2>
                        <p className="text-light-text-secondary">
                            {technician?.fullName || technician?.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-light-bg rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-light-text-tertiary" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            {success}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Mark Today's Attendance */}
                    {isCurrentMonth && (
                        <div className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-light-text mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary-400" />
                                Mark Today's Attendance
                            </h3>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleMarkAttendance('Present')}
                                    disabled={markingAttendance}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500/20 text-green-400 rounded-xl font-semibold hover:bg-green-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {markingAttendance ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5" />
                                    )}
                                    Mark Present
                                </button>
                                <button
                                    onClick={() => handleMarkAttendance('Absent')}
                                    disabled={markingAttendance}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-semibold hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {markingAttendance ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <XCircle className="w-5 h-5" />
                                    )}
                                    Mark Absent
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Month Selector */}
                    <div className="flex items-center justify-between bg-light-bg border border-light-border rounded-xl p-4">
                        <button
                            onClick={handlePreviousMonth}
                            disabled={selectedMonth === 1}
                            className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5 text-light-text" />
                        </button>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-light-text">
                                {months[selectedMonth - 1]} {selectedYear}
                            </h3>
                        </div>
                        <button
                            onClick={handleNextMonth}
                            disabled={isCurrentMonth}
                            className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5 text-light-text" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                        </div>
                    ) : attendanceData ? (
                        <>
                            {/* Statistics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-light-bg border border-light-border rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-primary-400" />
                                        <p className="text-sm text-light-text-secondary">Total Days</p>
                                    </div>
                                    <p className="text-2xl font-bold text-light-text">
                                        {attendanceData.statistics.totalDays}
                                    </p>
                                </div>

                                <div className="bg-light-bg border border-light-border rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <p className="text-sm text-light-text-secondary">Present</p>
                                    </div>
                                    <p className="text-2xl font-bold text-green-400">
                                        {attendanceData.statistics.presentDays}
                                    </p>
                                </div>

                                <div className="bg-light-bg border border-light-border rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="w-4 h-4 text-red-400" />
                                        <p className="text-sm text-light-text-secondary">Absent</p>
                                    </div>
                                    <p className="text-2xl font-bold text-red-400">
                                        {attendanceData.statistics.absentDays}
                                    </p>
                                </div>

                                <div className="bg-light-bg border border-light-border rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-accent-400" />
                                        <p className="text-sm text-light-text-secondary">Percentage</p>
                                    </div>
                                    <p className="text-2xl font-bold text-accent-400">
                                        {attendanceData.statistics.attendancePercentage}%
                                    </p>
                                </div>
                            </div>

                            {/* Attendance Records */}
                            {attendanceData.attendance.length > 0 ? (
                                <div className="bg-light-bg border border-light-border rounded-xl overflow-hidden">
                                    <div className="p-4 border-b border-light-border">
                                        <h3 className="font-semibold text-light-text">Attendance Records</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        <table className="w-full">
                                            <thead className="bg-white sticky top-0">
                                                <tr>
                                                    <th className="text-left px-4 py-3 text-sm font-semibold text-light-text-secondary">
                                                        Date
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-sm font-semibold text-light-text-secondary">
                                                        Day
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-sm font-semibold text-light-text-secondary">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendanceData.attendance
                                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                    .map((record, index) => {
                                                        const date = new Date(record.date);
                                                        return (
                                                            <tr
                                                                key={index}
                                                                className="border-t border-light-border hover:bg-white/50 transition-colors"
                                                            >
                                                                <td className="px-4 py-3 text-sm text-light-text">
                                                                    {date.toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric'
                                                                    })}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-light-text-secondary">
                                                                    {date.toLocaleDateString('en-US', {
                                                                        weekday: 'long'
                                                                    })}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span
                                                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${record.status === 'Present'
                                                                            ? 'bg-green-500/20 text-green-400'
                                                                            : 'bg-red-500/20 text-red-400'
                                                                            }`}
                                                                    >
                                                                        {record.status === 'Present' ? (
                                                                            <CheckCircle className="w-3 h-3" />
                                                                        ) : (
                                                                            <XCircle className="w-3 h-3" />
                                                                        )}
                                                                        {record.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-light-bg border border-light-border rounded-xl">
                                    <Calendar className="w-12 h-12 text-light-text-tertiary mx-auto mb-3" />
                                    <p className="text-light-text-secondary">
                                        No attendance records for this month
                                    </p>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-light-border">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-light-bg border border-light-border rounded-xl font-semibold text-light-text hover:bg-light-surface-hover transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceModal;
