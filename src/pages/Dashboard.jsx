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

/* ─── Color palette built around #79bd4b ─────────────────────────────────
   --clr-base    : #79bd4b   (primary green)
   --clr-light   : #a0d073   (light tint)
   --clr-lighter : #d4edbe   (very light / backgrounds)
   --clr-dark    : #4e8230   (dark shade)
   --clr-darker  : #2e4d1b   (deeper shade)
   --clr-amber   : #f0a830   (warm accent for pending / warnings)
   --clr-rose    : #e05252   (danger)
   --clr-sky     : #38b2d4   (info / secondary)
   ─────────────────────────────────────────────────────────────────────── */

const Dashboard = () => {
    const { searchQuery } = useSearch();
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError]           = useState(null);

    const fetchDashboardData = async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
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

    useEffect(() => { fetchDashboardData(); }, []);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

    const getStatusBadge = (status) => ({
        completed:   'bg-[#d4edbe] text-[#2e4d1b]',
        in_progress: 'bg-[#dbeafe] text-[#1d4ed8]',
        pending:     'bg-[#fef3c7] text-[#92400e]',
        assigned:    'bg-[#ede9fe] text-[#5b21b6]',
        cancelled:   'bg-[#fee2e2] text-[#991b1b]',
    }[status] || 'bg-gray-100 text-gray-500');

    const getPaymentStatusBadge = (status) => ({
        paid:             'bg-[#d4edbe] text-[#2e4d1b]',
        'partially paid': 'bg-[#fef3c7] text-[#92400e]',
        pending:          'bg-[#ffedd5] text-[#9a3412]',
        cancelled:        'bg-[#fee2e2] text-[#991b1b]',
    }[status] || 'bg-gray-100 text-gray-500');

    /* ── Loading ── */
    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-[#f6faf1]">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[#d4edbe] border-t-[#79bd4b] animate-spin" />
                <p className="text-[#4e8230] font-medium">Loading dashboard…</p>
            </div>
        </div>
    );

    /* ── Error ── */
    if (error) return (
        <div className="flex items-center justify-center h-screen bg-[#f6faf1]">
            <div className="text-center">
                <AlertCircle className="w-12 h-12 text-[#e05252] mx-auto mb-4" />
                <p className="text-gray-700 mb-4">{error}</p>
                <button
                    onClick={() => fetchDashboardData()}
                    className="px-6 py-2 bg-[#79bd4b] text-white rounded-lg hover:bg-[#4e8230] transition-colors font-medium"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    if (!dashboardData) return null;

    const { assignments, technicians, revenue, recentActivity, performance } = dashboardData;

    const stats = [
        {
            label:    'Total Revenue',
            value:    formatCurrency(revenue.total),
            change:   revenue.collectionRate,
            trend:    parseFloat(revenue.collectionRate) >= 80 ? 'up' : 'down',
            icon:     DollarSign,
            from:     '#79bd4b',
            to:       '#4e8230',
            subtitle: `Collected: ${formatCurrency(revenue.collected)}`,
        },
        {
            label:    'Total Assignments',
            value:    assignments.total,
            change:   assignments.completionRate,
            trend:    parseFloat(assignments.completionRate) >= 60 ? 'up' : 'down',
            icon:     Calendar,
            from:     '#a0d073',
            to:       '#79bd4b',
            subtitle: `Completed: ${assignments.completed}`,
        },
        {
            label:    'Active Technicians',
            value:    technicians.active,
            change:   technicians.activePercentage,
            trend:    parseFloat(technicians.activePercentage) >= 80 ? 'up' : 'down',
            icon:     Users,
            from:     '#38b2d4',
            to:       '#0e7490',
            subtitle: `Total: ${technicians.total}`,
        },
        {
            label:    'Pending Revenue',
            value:    formatCurrency(revenue.pending),
            change:   `${assignments.pending} pending`,
            trend:    assignments.pending > 10 ? 'down' : 'up',
            icon:     Clock,
            from:     '#f0a830',
            to:       '#c27d10',
            subtitle: `In Progress: ${assignments.inProgress}`,
        },
    ];

    const PIE_COLORS = ['#79bd4b', '#4e8230', '#a0d073', '#2e4d1b', '#c5e4a3'];

    const serviceDistribution = performance.popularServices?.slice(0, 5).map((svc, i) => ({
        name:    svc._id || 'Unknown',
        value:   svc.count,
        revenue: svc.totalRevenue,
        color:   PIE_COLORS[i] || '#6b7280',
    })) || [];

    const technicianPerformanceData = performance.topTechnicians?.slice(0, 4).map((t) => ({
        name:      t.technicianName || t.username,
        completed: t.completedAssignments,
        total:     t.totalAssignments,
        pending:   t.totalAssignments - t.completedAssignments,
    })) || [];

    /* ════════════════════════════════════════════════════════════════════ */
    return (
        <div className="min-h-screen bg-[#f6faf1]">

            {/* ── CSS variables injected via style tag ─────────────────── */}
            <style>{`
                .card {
                    background: #ffffff;
                    border: 1px solid #d4edbe;
                    border-radius: 1rem;
                    transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
                }
                .card:hover {
                    border-color: #79bd4b;
                    box-shadow: 0 8px 30px rgba(121,189,75,0.12);
                    transform: translateY(-2px);
                }
                .stat-badge-up   { color: #4e8230; }
                .stat-badge-down { color: #c27d10; }
                @keyframes fadeSlide {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeslide { animation: fadeSlide 0.4s ease both; }
            `}</style>

            <div className="max-w-screen-xl mx-auto p-6 space-y-6 animate-fadeslide">

                {/* ── Page Header ───────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#2e4d1b] tracking-tight">Dashboard</h1>
                        <p className="text-sm text-[#4e8230] mt-1">
                            Welcome back! Here's what's happening with your pest control business.
                        </p>
                    </div>
                    <button
                        onClick={() => fetchDashboardData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#d4edbe] rounded-lg hover:border-[#79bd4b] hover:bg-[#f6faf1] transition-all text-[#2e4d1b] font-medium text-sm"
                    >
                        <RefreshCw className={`w-4 h-4 text-[#79bd4b] ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>

                {/* ── Stats Grid ────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {stats.map((stat, i) => (
                        <div key={i} className="card p-5 group">
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                                    style={{ background: `linear-gradient(135deg, ${stat.from}, ${stat.to})` }}
                                >
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'stat-badge-up' : 'stat-badge-down'}`}>
                                    {stat.trend === 'up'
                                        ? <TrendingUp  className="w-3.5 h-3.5" />
                                        : <TrendingDown className="w-3.5 h-3.5" />
                                    }
                                    {stat.change}
                                </div>
                            </div>
                            <div className="text-2xl font-extrabold text-[#1a2e0e] mb-0.5">{stat.value}</div>
                            <div className="text-xs font-semibold text-[#4e8230] uppercase tracking-wide mb-0.5">{stat.label}</div>
                            <div className="text-xs text-[#7aac52]">{stat.subtitle}</div>
                        </div>
                    ))}
                </div>

                {/* ── Quick Stats Row ───────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Today's Assignments", value: assignments.today,              icon: <Calendar   className="w-7 h-7 text-[#79bd4b]" /> },
                        { label: 'This Month',          value: assignments.thisMonth,          icon: <TrendingUp className="w-7 h-7 text-[#4e8230]" /> },
                        { label: "Today's Revenue",     value: formatCurrency(revenue.today),  icon: <DollarSign className="w-7 h-7 text-[#f0a830]" /> },
                        { label: 'Month Revenue',       value: formatCurrency(revenue.thisMonth), icon: <DollarSign className="w-7 h-7 text-[#38b2d4]" /> },
                    ].map((q, i) => (
                        <div key={i} className="card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-[#7aac52] font-medium mb-0.5">{q.label}</p>
                                    <p className="text-xl font-extrabold text-[#1a2e0e]">{q.value}</p>
                                </div>
                                {q.icon}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Charts Row ────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Popular Services Pie */}
                    {serviceDistribution.length > 0 && (
                        <div className="card p-6">
                            <h3 className="text-base font-bold text-[#2e4d1b] mb-5">Popular Services</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={serviceDistribution}
                                        cx="50%" cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        dataKey="value"
                                    >
                                        {serviceDistribution.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a2e0e', border: '1px solid #4e8230', borderRadius: '8px', color: '#d4edbe' }}
                                        formatter={(value, name, props) => [
                                            `${value} assignments (${formatCurrency(props.payload.revenue)})`, name,
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Technician Performance Bar */}
                    {technicianPerformanceData.length > 0 && (
                        <div className="card p-6">
                            <h3 className="text-base font-bold text-[#2e4d1b] mb-5">Top Technician Performance</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={technicianPerformanceData} barCategoryGap="30%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#d4edbe" />
                                    <XAxis dataKey="name" stroke="#7aac52" tick={{ fontSize: 11 }} />
                                    <YAxis stroke="#7aac52" tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a2e0e', border: '1px solid #4e8230', borderRadius: '8px', color: '#d4edbe' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 12, color: '#4e8230' }} />
                                    <Bar dataKey="completed" name="Completed" fill="#79bd4b" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="pending"   name="Pending"   fill="#f0a830" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* ── Recent Activity & Payment Breakdown ───────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Recent Assignments */}
                    <div className="card p-6">
                        <h3 className="text-base font-bold text-[#2e4d1b] mb-5">Recent Assignments</h3>
                        <div className="space-y-3">
                            {recentActivity.assignments
                                ?.filter(a =>
                                    a.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    a.serviceTitle?.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .slice(0, 5)
                                .map((assignment) => (
                                    <div
                                        key={assignment._id}
                                        className="flex items-center justify-between p-3 bg-[#f6faf1] rounded-xl hover:bg-[#edf7e4] transition-colors duration-200"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold text-[#1a2e0e]">
                                                    {assignment.customer?.name || 'Unknown Customer'}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(assignment.status)}`}>
                                                    {assignment.status?.replace('_', ' ') || 'Pending'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-[#7aac52]">
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
                                        <div className="text-right ml-3">
                                            <div className="text-base font-extrabold text-[#4e8230]">
                                                {formatCurrency(assignment.paymentAmount || 0)}
                                            </div>
                                            <span className={`text-xs font-medium ${getPaymentStatusBadge(assignment.paymentstatus)}`}>
                                                {assignment.paymentstatus || 'pending'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    {/* Payment Mode Distribution */}
                    {performance.paymentBreakdown?.length > 0 && (
                        <div className="card p-6">
                            <h3 className="text-base font-bold text-[#2e4d1b] mb-5">Payment Mode Distribution</h3>
                            <div className="space-y-4">
                                {performance.paymentBreakdown.map((payment, idx) => {
                                    const rate = payment.totalAmount > 0
                                        ? ((payment.collectedAmount / payment.totalAmount) * 100).toFixed(1)
                                        : 0;
                                    return (
                                        <div key={idx} className="p-3 bg-[#f6faf1] rounded-xl hover:bg-[#edf7e4] transition-colors duration-200">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-semibold text-[#1a2e0e] capitalize">
                                                    {payment._id || 'Unknown Method'}
                                                </span>
                                                <span className="text-xs text-[#7aac52]">
                                                    {payment.count} transactions
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-[#7aac52]">
                                                    Total: {formatCurrency(payment.totalAmount)}
                                                </span>
                                                <span className="text-xs font-semibold text-[#4e8230]">
                                                    Collected: {formatCurrency(payment.collectedAmount)}
                                                </span>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="w-full bg-[#d4edbe] rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${rate}%`,
                                                        background: 'linear-gradient(90deg, #79bd4b, #4e8230)',
                                                    }}
                                                />
                                            </div>
                                            <div className="text-xs text-right text-[#7aac52] mt-1">{rate}% collected</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

            </div>{/* end max-w */}
        </div>
    );
};

export default Dashboard;