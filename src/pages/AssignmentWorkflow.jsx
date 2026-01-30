import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ClipboardList, ArrowLeft, Loader2, Beaker, Camera, DollarSign,
    Trash2, Save, Plus, XCircle, CheckCircle2, User, MapPin, Phone
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    getAssignmentById,
    addTreatmentPreparation,
    deleteTreatmentPreparation,
    updateTreatmentPreparation,
    addSitePicture,
    deleteSitePicture,
    addPaymentCollection,
    deletePaymentCollection,
    updatePaymentCollection,
    deleteAssignment,
    updateServiceStatus
} from '../services/assignmentService';

const AssignmentWorkflow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);

    // Forms
    const [prepForm, setPrepForm] = useState({ chemicals: '', quantity: '' });
    const [pictureFile, setPictureFile] = useState(null);
    const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'cash' });

    useEffect(() => {
        fetchAssignment();
    }, [id]);

    // ... (fetchAssignment remains same)

    const fetchAssignment = async () => {
        try {
            setLoading(true);
            const response = await getAssignmentById(id);
            setAssignment(response.data);
        } catch (error) {
            console.error('Error fetching assignment:', error);
            toast.error('Failed to load assignment details');
            navigate('/assignments');
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 1: TREATMENT PREPARATION ---
    const handleAddPrep = async (e) => {
        e.preventDefault();
        try {
            await addTreatmentPreparation(id, prepForm);
            toast.success('Preparation item added');
            setPrepForm({ chemicals: '', quantity: '' });
            fetchAssignment();
        } catch (error) {
            toast.error('Failed to add item');
        }
    };

    const handleDeletePrep = async (itemId) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await deleteTreatmentPreparation(id, itemId);
            toast.success('Item removed');
            fetchAssignment();
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    // --- STEP 2: SITE PICTURES ---
    const handleUploadPicture = async (e) => {
        e.preventDefault();
        if (!pictureFile) return toast.error('Please select a file');

        try {
            const formData = new FormData();
            formData.append('image', pictureFile);
            formData.append('description', 'Site visit picture');

            await addSitePicture(id, formData);
            toast.success('Picture uploaded');
            setPictureFile(null);
            // Reset file input if possible, or just re-render
            document.getElementById('file-upload').value = '';
            fetchAssignment();
        } catch (error) {
            console.error(error);
            toast.error('Upload failed');
        }
    };

    const handleDeletePicture = async (picId) => {
        if (!window.confirm('Delete this picture?')) return;
        try {
            await deleteSitePicture(id, picId);
            toast.success('Picture deleted');
            fetchAssignment();
        } catch (error) {
            toast.error('Failed to delete picture');
        }
    };

    // --- STEP 3: PAYMENTS ---
    useEffect(() => {
        if (assignment?.paymentCollection && assignment.paymentCollection.amount > 0) {
            setPaymentForm({
                amount: assignment.paymentCollection.amount,
                paymentMethod: assignment.paymentCollection.paymentMethod
            });
        } else {
            // Reset to default
            setPaymentForm({ amount: '', paymentMethod: 'cash' });
        }
    }, [assignment]);

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            if (assignment.paymentCollection && assignment.paymentCollection.amount > 0) {
                await updatePaymentCollection(id, paymentForm);
                toast.success('Payment updated');
            } else {
                await addPaymentCollection(id, paymentForm);
                toast.success('Payment recorded');
                setPaymentForm({ amount: '', paymentMethod: 'cash' });
            }
            fetchAssignment();
        } catch (error) {
            toast.error('Payment failed');
        }
    };

    const handleDeletePayment = async () => {
        if (!window.confirm('Delete payment record?')) return;
        try {
            await deletePaymentCollection(id);
            toast.success('Payment removed');
            fetchAssignment();
        } catch (error) {
            toast.error('Failed to remove payment');
        }
    };



    // --- STEP 3: SERVICE EXECUTION ---
    const handleServiceStatusUpdate = async (subServiceId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
            await updateServiceStatus(id, subServiceId, newStatus);
            toast.success(`Service marked as ${newStatus}`);
            fetchAssignment();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // --- ACTIONS ---
    const handleDeleteAssignment = async () => {
        if (!window.confirm('CRITICAL: Delete entire assignment? This cannot be undone.')) return;
        try {
            await deleteAssignment(id);
            toast.success('Assignment deleted');
            navigate('/assignments');
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-10 h-10 text-primary-500" /></div>;
    if (!assignment) return <div>Assignment not found</div>;

    const customer = assignment.bookingId?.customerId || assignment.customer || {};
    const technician = assignment.technicianId || {};
    const booking = assignment.bookingId || {};

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/assignments')} className="p-2 hover:bg-dark-surface-hover rounded-lg transition-colors">
                        <ArrowLeft className="w-6 h-6 text-dark-text" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-dark-text">Workflow Test Console</h1>
                        <p className="text-dark-text-secondary">Testing Steps for Assignment #{id.slice(-6).toUpperCase()}</p>
                    </div>
                </div>
                <button onClick={handleDeleteAssignment} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete Assignment
                </button>
            </div>

            {/* INFO CARD */}
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h3 className="text-xs font-semibold text-dark-text-tertiary mb-2 uppercase">Customer</h3>
                    <p className="text-dark-text font-medium flex items-center gap-2"><User className="w-4 h-4" /> {customer.fullName || 'N/A'}</p>
                    <p className="text-dark-text-secondary text-sm">{customer.mobileNumber}</p>
                    <p className="text-dark-text-secondary text-sm flex items-start gap-1 mt-1"><MapPin className="w-3 h-3 mt-1" /> {customer.address}</p>
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-dark-text-tertiary mb-2 uppercase">Technician</h3>
                    <p className="text-dark-text font-medium flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> {technician.fullName || 'Unassigned'}</p>
                    <p className="text-dark-text-secondary text-sm">{technician.email}</p>
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-dark-text-tertiary mb-2 uppercase">Service / Booking</h3>
                    <p className="text-dark-text font-medium">{booking.serviceId?.title || 'General Service'}</p>
                    <p className="text-dark-text-secondary text-sm">Status: <span className="uppercase text-primary-400">{assignment.status}</span></p>
                </div>
            </div>

            {/* STEP 1: PREPARATION */}
            <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden">
                <div className="bg-dark-bg p-4 border-b border-dark-border flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">1</div>
                    <h2 className="text-lg font-bold text-dark-text">Treatment Preparation</h2>
                </div>
                <div className="p-6">
                    {/* List */}
                    <div className="space-y-3 mb-6">
                        {assignment.treatmentPreparation?.length === 0 && <p className="text-dark-text-secondary italic">No preparation items added.</p>}
                        {assignment.treatmentPreparation?.map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-3 bg-dark-bg rounded-lg border border-dark-border">
                                <div>
                                    <p className="text-dark-text font-medium">{item.chemicals} <span className="text-dark-text-tertiary">({item.quantity})</span></p>
                                </div>
                                <button onClick={() => handleDeletePrep(item._id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                    {/* Form */}
                    <form onSubmit={handleAddPrep} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-dark-bg/50 p-4 rounded-xl">
                        <input
                            placeholder="Chemical Name"
                            className="bg-dark-bg border border-dark-border rounded p-2 text-dark-text"
                            value={prepForm.chemicals} onChange={e => setPrepForm({ ...prepForm, chemicals: e.target.value })} required
                        />
                        <input
                            placeholder="Quantity (e.g. 500ml)"
                            className="bg-dark-bg border border-dark-border rounded p-2 text-dark-text"
                            value={prepForm.quantity} onChange={e => setPrepForm({ ...prepForm, quantity: e.target.value })} required
                        />
                        <button type="submit" className="bg-blue-500 text-white rounded p-2 font-medium hover:bg-blue-600 transition">Add Item</button>
                    </form>
                </div>
            </div>

            {/* STEP 2: SITE PICTURES */}
            <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden">
                <div className="bg-dark-bg p-4 border-b border-dark-border flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold">2</div>
                    <h2 className="text-lg font-bold text-dark-text">Site Pictures (Cloudinary)</h2>
                </div>
                <div className="p-6">
                    {/* Gallery */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {assignment.applyTreatment?.sitePictures?.length === 0 && <p className="col-span-4 text-dark-text-secondary italic">No pictures uploaded.</p>}
                        {assignment.applyTreatment?.sitePictures?.map((pic) => (
                            <div key={pic._id} className="relative group aspect-square bg-dark-bg rounded-lg overflow-hidden border border-dark-border">
                                <img src={pic.url} alt="Site" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => handleDeletePicture(pic._id)} className="bg-red-500 text-white p-2 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Upload */}
                    <form onSubmit={handleUploadPicture} className="flex gap-4 bg-dark-bg/50 p-4 rounded-xl items-center">
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={e => setPictureFile(e.target.files[0])}
                            className="text-dark-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20"
                        />
                        <button type="submit" disabled={!pictureFile} className="px-6 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 transition">Upload</button>
                    </form>
                </div>
            </div>

            {/* STEP 3: SERVICE EXECUTION */}
            <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden">
                <div className="bg-dark-bg p-4 border-b border-dark-border flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center text-orange-400 font-bold">3</div>
                    <h2 className="text-lg font-bold text-dark-text">Service Execution</h2>
                </div>
                <div className="p-6">
                    <div className="space-y-3">
                        {booking.subServiceIds?.length === 0 && <p className="text-dark-text-secondary italic">No services listed.</p>}
                        {booking.subServiceIds?.map((subItem, idx) => {
                            const service = subItem.serviceId || {};
                            const isCompleted = subItem.status === 'completed';
                            return (
                                <div key={idx} className={`flex items-center justify-between p-4 rounded-lg border transition-all ${isCompleted ? 'bg-green-500/5 border-green-500/20' : 'bg-dark-bg border-dark-border'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-dark-surface border border-dark-border overflow-hidden">
                                            {service.metaImage || service.image ? (
                                                <img src={service.metaImage || service.image} alt={service.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><Beaker className="w-5 h-5 text-dark-text-tertiary" /></div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-dark-text">{service.title || 'Unknown Service'}</h3>
                                            <p className="text-sm text-dark-text-secondary">₹{service.startingPrice}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleServiceStatusUpdate(subItem._id, subItem.status)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${isCompleted
                                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                            : 'bg-dark-surface border border-dark-border text-dark-text-secondary hover:text-dark-text hover:border-primary-500'
                                            }`}
                                    >
                                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                                        {isCompleted ? 'Completed' : 'Mark Done'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* STEP 4: PAYMENTS */}
            <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden">
                <div className="bg-dark-bg p-4 border-b border-dark-border flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center text-green-400 font-bold">4</div>
                    <h2 className="text-lg font-bold text-dark-text">Payment Collection</h2>
                </div>
                <div className="p-6">
                    {/* List */}
                    <div className="space-y-3 mb-6">
                        {(!assignment.paymentCollection || !assignment.paymentCollection.amount) && <p className="text-dark-text-secondary italic">No payments recorded.</p>}

                        {assignment.paymentCollection && assignment.paymentCollection.amount > 0 && (
                            <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg border border-dark-border">
                                <div>
                                    <p className="text-dark-text font-medium flex items-center gap-2">
                                        <span className="text-green-400">₹{assignment.paymentCollection.amount}</span>
                                        <span className="text-xs bg-dark-surface px-2 py-0.5 rounded capitalize border border-dark-border">{assignment.paymentCollection.paymentMethod}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded capitalize ${assignment.paymentCollection.paymentStatus === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{assignment.paymentCollection.paymentStatus}</span>
                                    </p>
                                    <p className="text-xs text-dark-text-secondary">{new Date(assignment.paymentCollection.paymentDate || Date.now()).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleDeletePayment()} className="text-red-400 hover:bg-red-500/10 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Form */}
                    <form onSubmit={handleAddPayment} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-dark-bg/50 p-4 rounded-xl">
                        <input
                            type="number"
                            placeholder="Amount"
                            className="bg-dark-bg border border-dark-border rounded p-2 text-dark-text"
                            value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} required
                        />
                        <select
                            className="bg-dark-bg border border-dark-border rounded p-2 text-dark-text"
                            value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                        >
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="online">Online</option>
                            <option value="upi">UPI</option>
                        </select>

                        <button type="submit" className="bg-green-500 text-white rounded p-2 font-medium hover:bg-green-600 transition">
                            {assignment.paymentCollection && assignment.paymentCollection.amount > 0 ? 'Update Payment' : 'Record Payment'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignmentWorkflow;
