import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Plus,

    Filter,
    Edit2,
    Trash2,
    RefreshCw,
    Phone,
    Mail,
    MapPin,
    Calendar,
    DollarSign,
} from 'lucide-react';
import customerService from '../services/customerService';
import { toast } from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';

const Customers = () => {
    const navigate = useNavigate();
    const { searchQuery, setSearchQuery } = useSearch();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    // Removed local searchTerm
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Fetch customers
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (statusFilter) params.status = statusFilter;

            const response = await customerService.getAllCustomers(params);
            setCustomers(response.data.customers);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [searchQuery, statusFilter]);

    // Delete customer
    const handleDeleteCustomer = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            const promise = customerService.deleteCustomer(id);
            toast.promise(promise, {
                loading: 'Deleting customer...',
                success: 'Customer deleted successfully',
                error: 'Failed to delete customer'
            });
            try {
                await promise;
                fetchCustomers();
            } catch (error) {
                console.error('Error deleting customer:', error);
            }
        }
    };

    // Toggle customer status
    const handleToggleStatus = async (id, currentStatus) => {
        const promise = customerService.toggleCustomerStatus(id);
        toast.promise(promise, {
            loading: 'Updating status...',
            success: `Customer ${currentStatus ? 'deactivated' : 'activated'} successfully`,
            error: 'Failed to update customer status'
        });
        try {
            await promise;
            fetchCustomers();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        const styles = {
            regular: 'bg-green-500/10 text-green-400',
            temporary: 'bg-blue-500/10 text-blue-400',
            other: 'bg-purple-500/10 text-purple-400',
        };
        return styles[status] || 'bg-gray-500/10 text-gray-400';
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-light-text dark:text-light-text mb-2">Customers</h1>
                    <p className="text-light-text-secondary dark:text-light-text-secondary">
                        Manage your customer database and relationships
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-white border border-light-border dark:border-light-border rounded-lg hover:border-primary-500 transition-all duration-300 text-light-text dark:text-light-text ${showFilters ? 'border-primary-500 ring-2 ring-primary-500/20' : ''
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <button
                        onClick={fetchCustomers}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white border border-light-border dark:border-light-border rounded-lg hover:border-primary-500 transition-all duration-300 text-light-text dark:text-light-text"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => navigate('/customers/create')}
                        className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200"
                    >
                        <Plus className="w-5 h-5" />
                        Add Customer
                    </button>
                </div>
            </div>

            {/* Filters */}
            {/* Filter Options */}
            {showFilters && (
                <div className="bg-white dark:bg-white border border-light-border dark:border-light-border rounded-2xl p-6 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-light-text dark:text-light-text mb-2">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-light-bg dark:bg-light-bg border border-light-border dark:border-light-border rounded-lg text-sm text-light-text dark:text-light-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            >
                                <option value="">All Status</option>
                                <option value="regular">Regular</option>
                                <option value="temporary">Temporary</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Customers Table */}
            <div className="bg-white dark:bg-white border border-light-border dark:border-light-border rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                ) : customers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Users className="w-16 h-16 text-light-text-tertiary dark:text-light-text-tertiary mb-4" />
                        <p className="text-light-text-secondary dark:text-light-text-secondary">No customers found</p>
                        <button
                            onClick={() => navigate('/customers/create')}
                            className="mt-4 text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300"
                        >
                            Add your first customer
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full">
                                <thead className="bg-light-bg dark:bg-light-bg border-b border-light-border dark:border-light-border">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-secondary dark:text-light-text-secondary uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-secondary dark:text-light-text-secondary uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-secondary dark:text-light-text-secondary uppercase tracking-wider">
                                            Location Link
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-secondary dark:text-light-text-secondary uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-secondary dark:text-light-text-secondary uppercase tracking-wider">
                                            Stats
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-secondary dark:text-light-text-secondary uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-light-border dark:divide-light-border">
                                    {customers.map((customer) => (
                                        <tr
                                            key={customer._id}
                                            className="hover:bg-light-surface-hover dark:hover:bg-light-surface-hover transition-colors duration-200"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        {customer.fullName
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join('')
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-light-text dark:text-light-text">
                                                            {customer.fullName}
                                                        </div>
                                                        <div className="text-xs text-light-text-tertiary dark:text-light-text-tertiary">
                                                            {formatDate(customer.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-light-text dark:text-light-text">
                                                        <Mail className="w-3 h-3 text-light-text-tertiary dark:text-light-text-tertiary" />
                                                        {customer.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-light-text-tertiary dark:text-light-text-tertiary">
                                                        <Phone className="w-3 h-3" />
                                                        {customer.mobileNo}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-2 text-sm text-light-text dark:text-light-text max-w-xs">
                                                    <MapPin className="w-3 h-3 text-light-text-tertiary dark:text-light-text-tertiary mt-1 flex-shrink-0" />
                                                    <a href={customer.googleMapLink} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline line-clamp-2 break-all">
                                                        {customer.googleMapLink || 'No link'}
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(
                                                            customer.status
                                                        )}`}
                                                    >
                                                        {customer.status}
                                                    </span>
                                                    <div>
                                                        <button
                                                            onClick={() =>
                                                                handleToggleStatus(
                                                                    customer._id,
                                                                    customer.isActive
                                                                )
                                                            }
                                                            className={`px-2 py-1 rounded text-xs font-semibold ${customer.isActive
                                                                ? 'bg-green-500/10 text-green-400'
                                                                : 'bg-gray-500/10 text-gray-400'
                                                                }`}
                                                        >
                                                            {customer.isActive ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex items-center gap-2 text-light-text dark:text-light-text">
                                                        <Calendar className="w-3 h-3 text-light-text-tertiary dark:text-light-text-tertiary" />
                                                        {customer.totalAssignments} assignments
                                                    </div>
                                                    <div className="flex items-center gap-2 text-light-text dark:text-light-text">
                                                        <DollarSign className="w-3 h-3 text-light-text-tertiary dark:text-light-text-tertiary" />
                                                        ₹{customer.totalSpent.toLocaleString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/customers/edit/${customer._id}`)}
                                                        className="p-2 hover:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-lg transition-colors duration-200"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteCustomer(
                                                                customer._id,
                                                                customer.fullName
                                                            )
                                                        }
                                                        className="p-2 hover:bg-red-500/10 text-red-500 dark:text-red-400 rounded-lg transition-colors duration-200"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                            {customers.map((customer) => (
                                <div
                                    key={customer._id}
                                    className="bg-white dark:bg-white border border-light-border dark:border-light-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between mb-3 border-b border-light-border pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {customer.fullName
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-light-text dark:text-light-text line-clamp-1">
                                                    {customer.fullName}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${getStatusBadge(
                                                            customer.status
                                                        )}`}
                                                    >
                                                        {customer.status}
                                                    </span>
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${customer.isActive
                                                            ? 'bg-green-500/10 text-green-400'
                                                            : 'bg-gray-500/10 text-gray-400'
                                                            }`}
                                                    >
                                                        {customer.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => navigate(`/customers/edit/${customer._id}`)}
                                                className="p-1.5 hover:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCustomer(customer._id, customer.fullName)}
                                                className="p-1.5 hover:bg-red-500/10 text-red-500 dark:text-red-400 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center gap-2 text-xs text-light-text dark:text-light-text">
                                            <Mail className="w-3.5 h-3.5 text-light-text-tertiary" />
                                            <span className="truncate">{customer.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-light-text dark:text-light-text">
                                            <Phone className="w-3.5 h-3.5 text-light-text-tertiary" />
                                            {customer.mobileNo}
                                        </div>
                                        <div className="flex items-start gap-2 text-xs text-light-text dark:text-light-text">
                                            <MapPin className="w-3.5 h-3.5 text-light-text-tertiary mt-0.5 shrink-0" />
                                            <a href={customer.googleMapLink} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline line-clamp-1 break-all">
                                                {customer.googleMapLink || 'No link'}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-light-border dark:border-light-border bg-light-bg/50 rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-light-text">
                                            <Calendar className="w-3.5 h-3.5 text-light-text-tertiary" />
                                            {customer.totalAssignments} jobs
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-accent-600 dark:text-accent-400">
                                            <DollarSign className="w-3.5 h-3.5" />
                                            ₹{customer.totalSpent.toLocaleString()}
                                        </div>
                                        <button
                                            onClick={() => handleToggleStatus(customer._id, customer.isActive)}
                                            className="text-[10px] underline text-light-text-tertiary hover:text-primary-500"
                                        >
                                            Toggle Status
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Customers;
