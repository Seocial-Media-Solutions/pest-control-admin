import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList, Plus, Search, Edit, Trash2, Eye, Loader2,
    User, DollarSign, Calendar, MapPin, Phone, Mail,
    Beaker, Camera, CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import {
    getAllAssignments, deleteAssignment, assignTechnician,
    addTreatmentPreparation, deleteTreatmentPreparation,
    addSitePicture, deleteSitePicture,
    addPaymentCollection, deletePaymentCollection,
} from '../services/assignmentService';
import { getAllTechnicians } from '../services/technicianService';
import { useSearch } from '../context/SearchContext';
import toast from 'react-hot-toast';

const Assignments = () => {
    const navigate = useNavigate();
    const { searchQuery, setSearchQuery } = useSearch();
    const [assignments, setAssignments]   = useState([]);
    const [technicians, setTechnicians]   = useState([]);
    const [loading, setLoading]           = useState(true);
    const [showDetailsModal, setShowDetailsModal]   = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showTreatmentModal, setShowTreatmentModal] = useState(false);
    const [showPictureModal, setShowPictureModal]     = useState(false);
    const [showPaymentModal, setShowPaymentModal]     = useState(false);

    const [treatmentForm, setTreatmentForm] = useState({ chemicals: '', quantity: '', instructions: '' });
    const [pictureForm, setPictureForm]     = useState({ file: null });
    const [paymentForm, setPaymentForm]     = useState({
        amount: 0, paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'pending',
    });

    useEffect(() => { fetchAssignments(); fetchTechnicians(); }, []);

    const fetchAssignments = async () => {
        try { setLoading(true); const data = await getAllAssignments(); setAssignments(data.data || []); }
        catch { toast.error('Failed to fetch assignments'); }
        finally { setLoading(false); }
    };

    const fetchTechnicians = async () => {
        try { const data = await getAllTechnicians(); setTechnicians(data.data || []); } catch {}
    };

    const handleDeleteAssignment = async (id) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try { await deleteAssignment(id); toast.success('Assignment deleted'); fetchAssignments(); }
            catch { toast.error('Failed to delete assignment'); }
        }
    };

    const handleAssignTechnician = async (assignmentId, technicianId) => {
        try { await assignTechnician(assignmentId, technicianId); toast.success('Technician assigned'); fetchAssignments(); }
        catch { toast.error('Failed to assign technician'); }
    };

    const handleAddTreatment = async (e) => {
        e.preventDefault();
        try { await addTreatmentPreparation(selectedAssignment._id, treatmentForm); toast.success('Treatment preparation added'); setShowTreatmentModal(false); setTreatmentForm({ chemicals: '', quantity: '', instructions: '' }); fetchAssignments(); }
        catch { toast.error('Failed to add treatment preparation'); }
    };

    const handleDeleteTreatment = async (itemId) => {
        if (window.confirm('Delete this treatment item?')) {
            try { await deleteTreatmentPreparation(selectedAssignment._id, itemId); toast.success('Item deleted'); fetchAssignments(); }
            catch { toast.error('Failed to delete item'); }
        }
    };

    const handleAddPicture = async (e) => {
        e.preventDefault();
        if (!pictureForm.file) { toast.error('Please select an image'); return; }
        const toastId = toast.loading('Uploading…');
        try {
            const formData = new FormData();
            formData.append('image', pictureForm.file);
            await addSitePicture(selectedAssignment._id, formData);
            toast.success('Picture added', { id: toastId });
            setShowPictureModal(false); setPictureForm({ file: null }); fetchAssignments();
        } catch { toast.error('Failed to upload picture', { id: toastId }); }
    };

    const handleDeletePicture = async (picId) => {
        if (window.confirm('Delete this picture?')) {
            try { await deleteSitePicture(selectedAssignment._id, picId); toast.success('Picture deleted'); fetchAssignments(); }
            catch { toast.error('Failed to delete picture'); }
        }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try { await addPaymentCollection(selectedAssignment._id, paymentForm); toast.success('Payment recorded'); setShowPaymentModal(false); setPaymentForm({ amount: 0, paymentMethod: 'cash', paymentDate: new Date().toISOString().split('T')[0], paymentStatus: 'pending' }); fetchAssignments(); }
        catch { toast.error('Failed to record payment'); }
    };

    const handleDeletePayment = async (paymentId) => {
        if (window.confirm('Delete this payment record?')) {
            try { await deletePaymentCollection(selectedAssignment._id, paymentId); toast.success('Payment deleted'); fetchAssignments(); }
            catch { toast.error('Failed to delete payment'); }
        }
    };

    const filteredAssignments = assignments.filter((a) => {
        const customer = a.bookingId?.customerId;
        return (
            (customer?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (customer?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (customer?.mobileNumber || '').includes(searchQuery)
        );
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 rounded-full border-4 border-[#d4edbe] border-t-[#79bd4b] animate-spin" />
        </div>
    );

    /* ── shared styles ── */
    const modalInput = "w-full px-4 py-2.5 bg-[#f6faf1] border border-[#d4edbe] rounded-lg text-[#1a2e0e] text-sm focus:outline-none focus:border-[#79bd4b] focus:ring-2 focus:ring-[#79bd4b]/20 transition-all";
    const btnPrimary = "flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg";

    return (
        <div className="space-y-6 animate-fade-in">
            <style>{`
                .ac { background:#fff; border:1px solid #d4edbe; border-radius:1rem; transition:border-color .25s,box-shadow .25s; }
                .ac:hover { border-color:#79bd4b; box-shadow:0 6px 24px rgba(121,189,75,.1); }
                .btn-g { background:linear-gradient(135deg,#79bd4b,#4e8230); color:#fff; border-radius:.75rem; font-weight:600; transition:all .2s; }
                .btn-g:hover { box-shadow:0 6px 20px rgba(121,189,75,.35); transform:translateY(-1px); }
            `}</style>

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2e4d1b]">Assignments</h1>
                    <p className="text-sm text-[#4e8230] mt-1">Manage service assignments with 3-step workflow</p>
                </div>
                <button onClick={() => navigate('/assignments/create')} className="btn-g flex items-center gap-2 px-5 py-2.5">
                    <Plus className="w-4 h-4" /> New Assignment
                </button>
            </div>

            {/* Search */}
            <div className="ac p-5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a0d073]" />
                    <input
                        type="text" placeholder="Search by customer name, email, or phone…"
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#f6faf1] border border-[#d4edbe] rounded-lg text-sm text-[#1a2e0e] placeholder:text-[#a0d073] focus:outline-none focus:border-[#79bd4b] focus:ring-2 focus:ring-[#79bd4b]/20 transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredAssignments.map((assignment) => (
                    <div key={assignment._id} className="ac overflow-hidden">
                        <div className="p-5">
                            {/* Card header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-[#1a2e0e]">Assignment #{assignment._id.slice(-6)}</h3>
                                    <p className="text-xs text-[#7aac52]">{new Date(assignment.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => { setSelectedAssignment(assignment); setShowDetailsModal(true); }}
                                        className="p-2 bg-[#d4edbe] text-[#4e8230] rounded-lg hover:bg-[#c5e4a3] transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteAssignment(assignment._id)}
                                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Customer */}
                            {assignment.bookingId?.customerId && (
                                <div className="bg-[#f6faf1] rounded-lg p-3 mb-3 border border-[#d4edbe]">
                                    <h4 className="text-[10px] font-bold text-[#7aac52] uppercase tracking-wider mb-2">Customer</h4>
                                    <div className="space-y-1.5">
                                        {[
                                            { icon: User,  val: assignment.bookingId.customerId.fullName },
                                            { icon: Phone, val: assignment.bookingId.customerId.mobileNo || 'N/A' },
                                            { icon: Mail,  val: assignment.bookingId.customerId.email },
                                        ].map(({ icon: Icon, val }) => (
                                            <div key={val} className="flex items-center gap-2 text-sm text-[#1a2e0e]">
                                                <Icon className="w-3.5 h-3.5 text-[#79bd4b]" />{val}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Technician / assign */}
                            {assignment.technicianId ? (
                                <div className="bg-[#d4edbe] rounded-lg p-3 mb-3">
                                    <div className="flex items-center gap-2 text-sm text-[#2e4d1b] font-semibold">
                                        <User className="w-4 h-4 text-[#79bd4b]" />
                                        Assigned to: {assignment.technicianId.fullName}
                                    </div>
                                </div>
                            ) : (
                                <select onChange={(e) => handleAssignTechnician(assignment._id, e.target.value)} defaultValue=""
                                    className="w-full px-3 py-2 mb-3 bg-[#f6faf1] border border-[#d4edbe] rounded-lg text-xs text-[#1a2e0e] focus:outline-none focus:border-[#79bd4b] transition-all">
                                    <option value="" disabled>Assign Technician</option>
                                    {technicians.map((t) => <option key={t._id} value={t._id}>{t.fullName}</option>)}
                                </select>
                            )}

                            {/* Workflow progress */}
                            <div className="space-y-1.5 mb-4">
                                {[
                                    { icon: Beaker,    label: 'Treatment Prep', val: `${assignment.treatmentPreparation?.length || 0} items` },
                                    { icon: Camera,    label: 'Site Pictures',  val: `${assignment.applyTreatment?.sitePictures?.length || 0} photos` },
                                    { icon: DollarSign,label: 'Payments',       val: `${assignment.paymentCollection?.amount || 0} records`, green: true },
                                ].map(({ icon: Icon, label, val, green }) => (
                                    <div key={label} className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1 text-[#4e8230]"><Icon className="w-3 h-3" />{label}</span>
                                        <span className={`font-semibold ${green ? 'text-[#4e8230]' : 'text-[#79bd4b]'}`}>{val}</span>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => navigate(`/assignments/${assignment._id}/workflow`)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#f6faf1] border border-[#d4edbe] hover:border-[#79bd4b] rounded-lg text-xs font-semibold text-[#2e4d1b] transition-all">
                                <ClipboardList className="w-3 h-3" /> Open Workflow
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty */}
            {filteredAssignments.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[36vh] text-center">
                    <ClipboardList className="w-14 h-14 text-[#a0d073] mb-3" />
                    <h3 className="text-xl font-bold text-[#2e4d1b] mb-1">No assignments found</h3>
                    <p className="text-[#4e8230] mb-5">{searchQuery ? 'Try adjusting your search' : 'Get started by creating your first assignment'}</p>
                    {!searchQuery && (
                        <button onClick={() => navigate('/assignments/create')} className="btn-g flex items-center gap-2 px-5 py-2.5">
                            <Plus className="w-4 h-4" /> New Assignment
                        </button>
                    )}
                </div>
            )}

            {/* ── Details Modal ── */}
            {showDetailsModal && selectedAssignment && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDetailsModal(false)}>
                    <div className="bg-white border border-[#d4edbe] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-[#d4edbe] sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-extrabold text-[#2e4d1b]">Assignment Details</h2>
                            <p className="text-xs text-[#7aac52]">ID: {selectedAssignment._id}</p>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Step 1 */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-base font-bold text-[#2e4d1b] flex items-center gap-2"><Beaker className="w-4 h-4 text-[#79bd4b]" />Step 1: Treatment Preparation</h3>
                                    <button onClick={() => { setShowTreatmentModal(true); setShowDetailsModal(false); }}
                                        className="px-3 py-1.5 bg-[#d4edbe] text-[#2e4d1b] rounded-lg text-xs font-semibold hover:bg-[#c5e4a3] transition-colors">
                                        <Plus className="w-3 h-3 inline mr-1" />Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {selectedAssignment.treatmentPreparation?.map((item) => (
                                        <div key={item._id} className="flex justify-between items-start p-3 bg-[#f6faf1] rounded-lg border border-[#d4edbe]">
                                            <div>
                                                <p className="font-semibold text-[#1a2e0e] text-sm">{item.chemicals}</p>
                                                <p className="text-xs text-[#4e8230]">Qty: {item.quantity}</p>
                                                <p className="text-xs text-[#7aac52] mt-0.5">{item.instructions}</p>
                                            </div>
                                            <button onClick={() => handleDeleteTreatment(item._id)} className="text-red-400 hover:text-red-500 p-1"><XCircle className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                    {!selectedAssignment.treatmentPreparation?.length && <p className="text-[#a0d073] text-sm italic">No treatment items added yet</p>}
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-base font-bold text-[#2e4d1b] flex items-center gap-2"><Camera className="w-4 h-4 text-[#79bd4b]" />Step 2: Site Pictures</h3>
                                    <button onClick={() => { setShowPictureModal(true); setShowDetailsModal(false); }}
                                        className="px-3 py-1.5 bg-[#d4edbe] text-[#2e4d1b] rounded-lg text-xs font-semibold hover:bg-[#c5e4a3] transition-colors">
                                        <Plus className="w-3 h-3 inline mr-1" />Add
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {selectedAssignment.applyTreatment?.sitePictures?.map((pic) => (
                                        <div key={pic._id} className="relative group rounded-lg overflow-hidden border border-[#d4edbe]">
                                            <img src={pic.url} alt={pic.filename} className="w-full h-28 object-cover" />
                                            <button onClick={() => handleDeletePicture(pic._id)} className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><XCircle className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                    {!selectedAssignment.applyTreatment?.sitePictures?.length && <p className="col-span-3 text-[#a0d073] text-sm italic">No pictures added yet</p>}
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-base font-bold text-[#2e4d1b] flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#79bd4b]" />Step 3: Payment Collection</h3>
                                    <button onClick={() => { setShowPaymentModal(true); setShowDetailsModal(false); }}
                                        className="px-3 py-1.5 bg-[#d4edbe] text-[#2e4d1b] rounded-lg text-xs font-semibold hover:bg-[#c5e4a3] transition-colors">
                                        <Plus className="w-3 h-3 inline mr-1" />Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {selectedAssignment.paymentCollection?.map((payment) => (
                                        <div key={payment._id} className="flex justify-between items-start p-3 bg-[#f6faf1] rounded-lg border border-[#d4edbe]">
                                            <div>
                                                <p className="text-lg font-bold text-[#2e4d1b]">₹{payment.amount}</p>
                                                <p className="text-xs text-[#4e8230]">{payment.paymentMethod.toUpperCase()} · {new Date(payment.paymentDate).toLocaleDateString()}</p>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${payment.paymentStatus === 'completed' ? 'bg-[#d4edbe] text-[#2e4d1b]' : 'bg-yellow-50 text-yellow-600'}`}>
                                                    {payment.paymentStatus.toUpperCase()}
                                                </span>
                                            </div>
                                            <button onClick={() => handleDeletePayment(payment._id)} className="text-red-400 hover:text-red-500 p-1"><XCircle className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                    {!selectedAssignment.paymentCollection?.length && <p className="text-[#a0d073] text-sm italic">No payments recorded yet</p>}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-[#d4edbe]">
                            <button onClick={() => setShowDetailsModal(false)}
                                className="w-full px-6 py-3 bg-[#f6faf1] border border-[#d4edbe] hover:border-[#79bd4b] rounded-xl font-semibold text-[#2e4d1b] transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Treatment Modal ── */}
            {showTreatmentModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTreatmentModal(false)}>
                    <div className="bg-white border border-[#d4edbe] rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-[#d4edbe]"><h2 className="text-xl font-bold text-[#2e4d1b]">Add Treatment Preparation</h2></div>
                        <form onSubmit={handleAddTreatment} className="p-6 space-y-4">
                            {[['Chemicals *', 'chemicals', 'text'], ['Quantity *', 'quantity', 'text']].map(([label, key, type]) => (
                                <div key={key}>
                                    <label className="block text-sm font-semibold text-[#2e4d1b] mb-2">{label}</label>
                                    <input type={type} value={treatmentForm[key]} onChange={(e) => setTreatmentForm({ ...treatmentForm, [key]: e.target.value })} className={modalInput} required />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-semibold text-[#2e4d1b] mb-2">Instructions *</label>
                                <textarea value={treatmentForm.instructions} onChange={(e) => setTreatmentForm({ ...treatmentForm, instructions: e.target.value })} rows={3} className={modalInput} required />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowTreatmentModal(false)} className="flex-1 px-6 py-3 bg-[#f6faf1] border border-[#d4edbe] rounded-xl font-semibold text-[#2e4d1b] hover:border-[#79bd4b] transition-colors">Cancel</button>
                                <button type="submit" className={`${btnPrimary} btn-g`}>Add Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Picture Modal ── */}
            {showPictureModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPictureModal(false)}>
                    <div className="bg-white border border-[#d4edbe] rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-[#d4edbe]"><h2 className="text-xl font-bold text-[#2e4d1b]">Add Site Picture</h2></div>
                        <form onSubmit={handleAddPicture} className="p-6 space-y-4">
                            <div className="border-2 border-dashed border-[#d4edbe] hover:border-[#79bd4b] rounded-xl p-8 text-center relative transition-colors cursor-pointer">
                                <input type="file" accept="image/*" onChange={(e) => setPictureForm({ file: e.target.files[0] })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <Camera className="w-8 h-8 text-[#79bd4b] mx-auto mb-2" />
                                <p className="text-sm text-[#1a2e0e]">{pictureForm.file ? pictureForm.file.name : 'Click or drag to upload'}</p>
                                <p className="text-xs text-[#7aac52] mt-1">JPG, PNG, WEBP</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowPictureModal(false)} className="flex-1 px-6 py-3 bg-[#f6faf1] border border-[#d4edbe] rounded-xl font-semibold text-[#2e4d1b] hover:border-[#79bd4b] transition-colors">Cancel</button>
                                <button type="submit" className={`${btnPrimary} btn-g`}>Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Payment Modal ── */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPaymentModal(false)}>
                    <div className="bg-white border border-[#d4edbe] rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-[#d4edbe]"><h2 className="text-xl font-bold text-[#2e4d1b]">Add Payment Record</h2></div>
                        <form onSubmit={handleAddPayment} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#2e4d1b] mb-2">Amount (₹) *</label>
                                <input type="number" min="0" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })} className={modalInput} required />
                            </div>
                            {[
                                { label: 'Payment Method *', key: 'paymentMethod', options: ['cash','card','upi','bank_transfer','other'] },
                                { label: 'Payment Status *', key: 'paymentStatus', options: ['pending','completed','failed'] },
                            ].map(({ label, key, options }) => (
                                <div key={key}>
                                    <label className="block text-sm font-semibold text-[#2e4d1b] mb-2">{label}</label>
                                    <select value={paymentForm[key]} onChange={(e) => setPaymentForm({ ...paymentForm, [key]: e.target.value })} className={modalInput}>
                                        {options.map((o) => <option key={o} value={o}>{o.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
                                    </select>
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-semibold text-[#2e4d1b] mb-2">Payment Date *</label>
                                <input type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })} className={modalInput} required />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 px-6 py-3 bg-[#f6faf1] border border-[#d4edbe] rounded-xl font-semibold text-[#2e4d1b] hover:border-[#79bd4b] transition-colors">Cancel</button>
                                <button type="submit" className={`${btnPrimary} btn-g`}>Add Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;
