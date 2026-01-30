import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Calendar,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    User,
} from 'lucide-react';
import { getAttendanceByMonth, getTechnicianById } from '../../services/technicianService';
import toast from 'react-hot-toast';

export default function Attendance() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    // Format month for API (YYYY-MM)
    const formatMonthForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    // Fetch technician details
    const {
        data: technicianData,
        isLoading: technicianLoading,
    } = useQuery({
        queryKey: ['technician', id],
        queryFn: async () => {
            const response = await getTechnicianById(id);
            return response.data;
        },
        enabled: !!id,
    });

    // Fetch attendance data
    const {
        data: attendanceResponse,
        isLoading: attendanceLoading,
        error: attendanceError,
    } = useQuery({
        queryKey: ['attendance', id, formatMonthForAPI(selectedMonth)],
        queryFn: async () => {
            const monthParam = formatMonthForAPI(selectedMonth);
            const response = await getAttendanceByMonth(id, monthParam);
            return response.data; // This contains { technicianId, technicianName, month, year, statistics, attendance }
        },
        enabled: !!id,
    });

    // Extract the attendance array from the response
    const attendanceData = attendanceResponse?.attendance || [];

    // Handle month navigation
    const handlePreviousMonth = () => {
        setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
    };

    const handleCurrentMonth = () => {
        setSelectedMonth(new Date());
    };

    // Get calendar days for the selected month
    const getCalendarDays = () => {
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    // Get attendance status for a specific day
    const getAttendanceForDay = (day) => {
        if (!attendanceData || !day) return null;

        const year = selectedMonth.getFullYear();
        const month = String(selectedMonth.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        return attendanceData.find(record => {
            const recordDate = new Date(record.date).toISOString().split('T')[0];
            return recordDate === dateStr;
        });
    };

    // Calculate statistics
    const calculateStats = () => {
        if (!attendanceData) return { present: 0, absent: 0, total: 0 };

        const present = attendanceData.filter(record => record.status === 'Present').length;
        const absent = attendanceData.filter(record => record.status === 'Absent').length;

        return {
            present,
            absent,
            total: attendanceData.length,
        };
    };

    const stats = calculateStats();
    const calendarDays = getCalendarDays();
    const monthName = selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (technicianLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-card rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate('/technicians')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Technicians</span>
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-black">
                        <Calendar className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Attendance Record</h1>
                        <p className="text-gray-500 flex items-center gap-2 mt-1">
                            <User size={16} />
                            {technicianData?.fullName || 'Loading...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-card rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Days</p>
                            <p className="text-3xl font-bold mt-1">{stats.total}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-100">
                            <Clock className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Present</p>
                            <p className="text-3xl font-bold mt-1 text-green-600">{stats.present}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-100">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Absent</p>
                            <p className="text-3xl font-bold mt-1 text-red-600">{stats.absent}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-red-100">
                            <XCircle className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-card rounded-lg shadow-lg p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">{monthName}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCurrentMonth}
                            className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50 transition"
                        >
                            Today
                        </button>
                        <button
                            onClick={handlePreviousMonth}
                            className="p-2 rounded-lg border hover:bg-gray-50 transition"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 rounded-lg border hover:bg-gray-50 transition"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                {attendanceLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-2">
                        {/* Day headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div
                                key={day}
                                className="text-center font-semibold text-gray-600 py-2 text-sm"
                            >
                                {day}
                            </div>
                        ))}

                        {/* Calendar days */}
                        {calendarDays.map((day, index) => {
                            if (!day) {
                                return <div key={`empty-${index}`} className="aspect-square" />;
                            }

                            const attendance = getAttendanceForDay(day);
                            const isToday =
                                day === new Date().getDate() &&
                                selectedMonth.getMonth() === new Date().getMonth() &&
                                selectedMonth.getFullYear() === new Date().getFullYear();

                            return (
                                <div
                                    key={day}
                                    className={`
                    aspect-square border rounded-lg p-2 flex flex-col items-center justify-center
                    transition-all
                    ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}
                    ${attendance?.status === 'Present' ? 'bg-green-50' : ''}
                    ${attendance?.status === 'Absent' ? 'bg-red-50' : ''}
                    ${!attendance ? 'bg-gray-50' : ''}
                  `}
                                >
                                    <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                                        {day}
                                    </span>
                                    {attendance && (
                                        <div className="mt-1">
                                            {attendance.status === 'Present' ? (
                                                <CheckCircle className="text-green-600" size={16} />
                                            ) : (
                                                <XCircle className="text-red-600" size={16} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-50 border border-gray-200"></div>
                        <span className="text-sm text-gray-600">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-50 border border-gray-200"></div>
                        <span className="text-sm text-gray-600">Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200"></div>
                        <span className="text-sm text-gray-600">Not Marked</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-blue-500"></div>
                        <span className="text-sm text-gray-600">Today</span>
                    </div>
                </div>
            </div>
        </div>
    );
}