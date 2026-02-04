import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    Calendar,
    DollarSign,
    Bug,
    CheckCircle,
    Clock,
    AlertCircle,
    RefreshCw,
    TrendingDown,
} from 'lucide-react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import dashboardService from '../services/dashboardService';
import { useSearch } from '../context/SearchContext';

const Dashboard = () => {
    const { searchQuery } = useSearch();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);

    // Fetch dashboard data
    const fetchDashboardData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const response = await dashboardService.getStats();
            setDashboardData(response.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        const styles = {
            completed: 'bg-green-500/10 text-green-400',
            in_progress: 'bg-blue-500/10 text-blue-400',
            pending: 'bg-orange-500/10 text-orange-400',
            assigned: 'bg-purple-500/10 text-purple-400',
            cancelled: 'bg-red-500/10 text-red-400',
        };
        return styles[status] || 'bg-gray-500/10 text-gray-400';
    };

    // Get payment status badge
    const getPaymentStatusBadge = (status) => {
        const styles = {
            paid: 'bg-green-500/10 text-green-400',
            'partially paid': 'bg-yellow-500/10 text-yellow-400',
            pending: 'bg-orange-500/10 text-orange-400',
            cancelled: 'bg-red-500/10 text-red-400',
        };
        return styles[status] || 'bg-gray-500/10 text-gray-400';
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-dark-text-secondary">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-dark-text mb-4">{error}</p>
                    <button
                        onClick={() => fetchDashboardData()}
                        className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!dashboardData) return null;

    const { assignments, technicians, revenue, recentActivity, performance } = dashboardData;

    // Prepare stats cards
    const stats = [
        {
            label: 'Total Revenue',
            value: formatCurrency(revenue.total),
            change: revenue.collectionRate,
            trend: parseFloat(revenue.collectionRate) >= 80 ? 'up' : 'down',
            icon: DollarSign,
            gradient: 'from-primary-500 to-accent-500',
            subtitle: `Collected: ${formatCurrency(revenue.collected)}`,
        },
        {
            label: 'Total Assignments',
            value: assignments.total,
            change: assignments.completionRate,
            trend: parseFloat(assignments.completionRate) >= 60 ? 'up' : 'down',
            icon: Calendar,
            gradient: 'from-purple-500 to-pink-500',
            subtitle: `Completed: ${assignments.completed}`,
        },
        {
            label: 'Active Technicians',
            value: technicians.active,
            change: technicians.activePercentage,
            trend: parseFloat(technicians.activePercentage) >= 80 ? 'up' : 'down',
            icon: Users,
            gradient: 'from-blue-500 to-cyan-500',
            subtitle: `Total: ${technicians.total}`,
        },
        {
            label: 'Pending Revenue',
            value: formatCurrency(revenue.pending),
            change: `${assignments.pending} pending`,
            trend: assignments.pending > 10 ? 'down' : 'up',
            icon: Clock,
            gradient: 'from-orange-500 to-red-500',
            subtitle: `In Progress: ${assignments.inProgress}`,
        },
    ];

    // Prepare service distribution data
    const serviceDistribution = performance.popularServices?.slice(0, 5).map((service, index) => ({
        name: service._id || 'Unknown Service',
        value: service.count,
        revenue: service.totalRevenue,
        color: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'][index] || '#6b7280',
    })) || [];

    // Prepare technician performance data
    const technicianPerformanceData = performance.topTechnicians?.slice(0, 4).map((tech) => ({
        name: tech.technicianName || tech.username,
        completed: tech.completedAssignments,
        total: tech.totalAssignments,
        pending: tech.totalAssignments - tech.completedAssignments,
    })) || [];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-dark-text mb-2">Dashboard</h1>
                    <p className="text-dark-text-secondary">
                        Welcome back! Here's what's happening with your pest control business.
                    </p>
                </div>
                <button
                    onClick={() => fetchDashboardData(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg hover:border-primary-500 transition-all duration-300 text-dark-text"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-dark-surface border border-dark-border rounded-2xl p-6 hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-1 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                            >
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div
                                className={`flex items-center gap-1 text-sm font-semibold ${stat.trend === 'up' ? 'text-green-400' : 'text-orange-400'
                                    }`}
                            >
                                {stat.trend === 'up' ? (
                                    <TrendingUp className="w-4 h-4" />
                                ) : (
                                    <TrendingDown className="w-4 h-4" />
                                )}
                                {stat.change}
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-dark-text mb-1">{stat.value}</div>
                        <div className="text-sm text-dark-text-secondary mb-1">{stat.label}</div>
                        <div className="text-xs text-dark-text-secondary/70">{stat.subtitle}</div>
                    </div>
                ))}
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-dark-text-secondary">Today's Assignments</p>
                            <p className="text-2xl font-bold text-dark-text">{assignments.today}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-primary-400" />
                    </div>
                </div>
                <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-dark-text-secondary">This Month</p>
                            <p className="text-2xl font-bold text-dark-text">{assignments.thisMonth}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-400" />
                    </div>
                </div>
                <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-dark-text-secondary">Today's Revenue</p>
                            <p className="text-2xl font-bold text-dark-text">
                                {formatCurrency(revenue.today)}
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-accent-400" />
                    </div>
                </div>
                <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-dark-text-secondary">Month Revenue</p>
                            <p className="text-2xl font-bold text-dark-text">
                                {formatCurrency(revenue.thisMonth)}
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-purple-400" />
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Distribution */}
                {serviceDistribution.length > 0 && (
                    <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 hover:border-primary-500 transition-all duration-300">
                        <h3 className="text-lg font-bold text-dark-text mb-6">
                            Popular Services
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={serviceDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {serviceDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1d26',
                                        border: '1px solid #2a2e3a',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value, name, props) => [
                                        `${value} assignments (${formatCurrency(props.payload.revenue)})`,
                                        name,
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Technician Performance */}
                {technicianPerformanceData.length > 0 && (
                    <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 hover:border-primary-500 transition-all duration-300">
                        <h3 className="text-lg font-bold text-dark-text mb-6">
                            Top Technician Performance
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={technicianPerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1a1d26',
                                        border: '1px solid #2a2e3a',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="completed" fill="#10b981" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="pending" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Recent Activity & Payment Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Assignments */}
                <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 hover:border-primary-500 transition-all duration-300">
                    <h3 className="text-lg font-bold text-dark-text mb-6">Recent Assignments</h3>
                    <div className="space-y-4">
                        {recentActivity.assignments?.filter(assignment =>
                            assignment.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            assignment.serviceTitle?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).slice(0, 5).map((assignment) => (
                            <div
                                key={assignment._id}
                                className="flex items-center justify-between p-4 bg-dark-bg rounded-xl hover:bg-dark-surface-hover transition-colors duration-200"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-sm font-semibold text-dark-text">
                                            {assignment.customer?.name || 'Unknown Customer'}
                                        </span>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                                                assignment.status
                                            )}`}
                                        >
                                            {assignment.status?.replace('_', ' ') || 'Pending'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-dark-text-secondary">
                                        <span className="flex items-center gap-1">
                                            <Bug className="w-3 h-3" />
                                            {assignment.serviceTitle || 'General Service'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(assignment.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-primary-400">
                                        {formatCurrency(assignment.paymentAmount || 0)}
                                    </div>
                                    <span
                                        className={`text-xs ${getPaymentStatusBadge(
                                            assignment.paymentstatus
                                        )}`}
                                    >
                                        {assignment.paymentstatus || 'pending'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Mode Breakdown */}
                {performance.paymentBreakdown && performance.paymentBreakdown.length > 0 && (
                    <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 hover:border-primary-500 transition-all duration-300">
                        <h3 className="text-lg font-bold text-dark-text mb-6">
                            Payment Mode Distribution
                        </h3>
                        <div className="space-y-4">
                            {performance.paymentBreakdown.map((payment, index) => {
                                const collectionRate =
                                    payment.totalAmount > 0
                                        ? ((payment.collectedAmount / payment.totalAmount) * 100).toFixed(1)
                                        : 0;
                                return (
                                    <div
                                        key={index}
                                        className="p-4 bg-dark-bg rounded-xl hover:bg-dark-surface-hover transition-colors duration-200"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-dark-text capitalize">
                                                {payment._id || 'Unknown Method'}
                                            </span>
                                            <span className="text-sm text-dark-text-secondary">
                                                {payment.count} transactions
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-dark-text-secondary">
                                                Total: {formatCurrency(payment.totalAmount)}
                                            </span>
                                            <span className="text-xs text-green-400">
                                                Collected: {formatCurrency(payment.collectedAmount)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-dark-border rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${collectionRate}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-right text-dark-text-secondary mt-1">
                                            {collectionRate}% collected
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default Dashboard;
