import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Plus,
    Search,
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

const Customers = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Fetch customers
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchTerm) params.search = searchTerm;
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
    }, [searchTerm, statusFilter]);

    // Delete customer
    const handleDeleteCustomer = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await customerService.deleteCustomer(id);
                toast.success('Customer deleted successfully');
                fetchCustomers();
            } catch (error) {
                console.error('Error deleting customer:', error);
                toast.error('Failed to delete customer');
            }
        }
    };

    // Toggle customer status
    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await customerService.toggleCustomerStatus(id);
            toast.success(
                `Customer ${currentStatus ? 'deactivated' : 'activated'} successfully`
            );
            fetchCustomers();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update customer status');
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-dark-text mb-2">Customers</h1>
                    <p className="text-dark-text-secondary">
                        Manage your customer database and relationships
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchCustomers}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg hover:border-primary-500 transition-all duration-300 text-dark-text"
                    >
                        <RefreshCw className="w-4 h-4" />
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
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-text-tertiary" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-sm text-dark-text placeholder:text-dark-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-sm font-medium text-dark-text hover:bg-dark-surface-hover hover:border-primary-500 transition-all duration-200"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-dark-border">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-text mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
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
            </div>

            {/* Customers Table */}
            <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                    </div>
                ) : customers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Users className="w-16 h-16 text-dark-text-tertiary mb-4" />
                        <p className="text-dark-text-secondary">No customers found</p>
                        <button
                            onClick={() => navigate('/customers/create')}
                            className="mt-4 text-primary-400 hover:text-primary-300"
                        >
                            Add your first customer
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-dark-bg border-b border-dark-border">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">
                                        Address
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">
                                        Stats
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border">
                                {customers.map((customer) => (
                                    <tr
                                        key={customer._id}
                                        className="hover:bg-dark-surface-hover transition-colors duration-200"
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
                                                    <div className="text-sm font-semibold text-dark-text">
                                                        {customer.fullName}
                                                    </div>
                                                    <div className="text-xs text-dark-text-tertiary">
                                                        {formatDate(customer.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-dark-text">
                                                    <Mail className="w-3 h-3 text-dark-text-tertiary" />
                                                    {customer.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-dark-text-tertiary">
                                                    <Phone className="w-3 h-3" />
                                                    {customer.mobileNo}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2 text-sm text-dark-text max-w-xs">
                                                <MapPin className="w-3 h-3 text-dark-text-tertiary mt-1 flex-shrink-0" />
                                                <span className="line-clamp-2">
                                                    {customer.address}
                                                </span>
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
                                                <div className="flex items-center gap-2 text-dark-text">
                                                    <Calendar className="w-3 h-3 text-dark-text-tertiary" />
                                                    {customer.totalAssignments} assignments
                                                </div>
                                                <div className="flex items-center gap-2 text-dark-text">
                                                    <DollarSign className="w-3 h-3 text-dark-text-tertiary" />
                                                    ₹{customer.totalSpent.toLocaleString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/customers/edit/${customer._id}`)}
                                                    className="p-2 hover:bg-primary-500/10 text-primary-400 rounded-lg transition-colors duration-200"
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
                                                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors duration-200"
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
                )}
            </div>
        </div>
    );
};

export default Customers;
