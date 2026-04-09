import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ClipboardList, ArrowLeft, Loader2, Beaker, Camera, ReceiptIndianRupee,
    Trash2, Plus, XCircle, CheckCircle2, User, MapPin, Download,
} from 'lucide-react';
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import AssignmentInvoice from '../components/AssignmentInvoice';
import { useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
    getAssignmentById,
    addTreatmentPreparation, deleteTreatmentPreparation,
    addSitePicture, deleteSitePicture,
    addPaymentCollection, deletePaymentCollection, updatePaymentCollection,
    deleteAssignment, updateServiceStatus,
} from '../services/assignmentService';

const AssignmentWorkflow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);

    const [prepForm, setPrepForm] = useState({ chemicals: '', quantity: '' });
    const [pictureFile, setPictureFile] = useState(null);
    const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'cash' });
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);
    const [printingAssignment, setPrintingAssignment] = useState(null);
    const invoiceRef = useRef(null);

    const handleDownloadInvoice = () => {
        setShowInvoicePreview(true);
    };

    const handleActualDownload = () => {
        setPrintingAssignment(assignment);

        setTimeout(() => {
            const element = invoiceRef.current;
            if (!element) {
                toast.error('Invoice template not ready');
                return;
            }

            const opt = {
                margin: 0,
                filename: `Invoice-${assignment._id.slice(-6).toUpperCase()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    windowWidth: 794
                },
                jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
            };

            const worker = html2pdf().from(element).set(opt);

            toast.promise(
                worker.save().then(() => {
                    setPrintingAssignment(null);
                    setShowInvoicePreview(false);
                }),
                {
                    loading: 'Preparing invoice...',
                    success: 'Invoice downloaded!',
                    error: (err) => `PDF Error: ${err.message || 'Generation failed'}`
                }
            );
        }, 300);
    };

    const fetchAssignment = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAssignmentById(id);
            setAssignment(response.data);
        } catch {
            toast.error('Failed to load assignment details');
            navigate('/assignments');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => { fetchAssignment(); }, [fetchAssignment]);

    useEffect(() => {
        if (assignment?.paymentCollection?.amount > 0) {
            setPaymentForm({ amount: assignment.paymentCollection.amount, paymentMethod: assignment.paymentCollection.paymentMethod });
        } else {
            setPaymentForm({ amount: '', paymentMethod: 'cash' });
        }
    }, [assignment]);

    const handleAddPrep = async (e) => {
        e.preventDefault();
        try { await addTreatmentPreparation(id, prepForm); toast.success('Item added'); setPrepForm({ chemicals: '', quantity: '' }); fetchAssignment(); }
        catch { toast.error('Failed to add item'); }
    };

    const handleDeletePrep = async (itemId) => {
        if (!window.confirm('Delete this item?')) return;
        try { await deleteTreatmentPreparation(id, itemId); toast.success('Item removed'); fetchAssignment(); }
        catch { toast.error('Failed to remove item'); }
    };

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
            document.getElementById('file-upload').value = '';
            fetchAssignment();
        } catch { toast.error('Upload failed'); }
    };

    const handleDeletePicture = async (picId) => {
        if (!window.confirm('Delete this picture?')) return;
        try { await deleteSitePicture(id, picId); toast.success('Picture deleted'); fetchAssignment(); }
        catch { toast.error('Failed to delete picture'); }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            if (assignment.paymentCollection?.amount > 0) {
                await updatePaymentCollection(id, paymentForm); toast.success('Payment updated');
            } else {
                await addPaymentCollection(id, paymentForm); toast.success('Payment recorded');
                setPaymentForm({ amount: '', paymentMethod: 'cash' });
            }
            fetchAssignment();
        } catch { toast.error('Payment failed'); }
    };

    const handleDeletePayment = async () => {
        if (!window.confirm('Delete payment record?')) return;
        try { await deletePaymentCollection(id); toast.success('Payment removed'); fetchAssignment(); }
        catch { toast.error('Failed to remove payment'); }
    };

    const handleServiceStatusUpdate = async (subServiceId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
            await updateServiceStatus(id, subServiceId, newStatus);
            toast.success(`Service marked as ${newStatus}`);
            fetchAssignment();
        } catch { toast.error('Failed to update status'); }
    };

    const handleDeleteAssignment = async () => {
        if (!window.confirm('CRITICAL: Delete entire assignment?')) return;
        try { await deleteAssignment(id); toast.success('Assignment deleted'); navigate('/assignments'); }
        catch { toast.error('Delete failed'); }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-[#f6faf1]">
            <div className="w-12 h-12 rounded-full border-4 border-[#d4edbe] border-t-[#79bd4b] animate-spin" />
        </div>
    );
    if (!assignment) return <div className="text-[#4e8230] p-8">Assignment not found</div>;

    const customer = assignment.bookingId?.customerId || assignment.customer || {};
    const technician = assignment.technicianId || {};
    const booking = assignment.bookingId || {};

    const inputCls = "bg-[#f6faf1] border border-[#d4edbe] rounded-lg p-2.5 text-[#1a2e0e] text-sm focus:outline-none focus:border-[#79bd4b] focus:ring-2 focus:ring-[#79bd4b]/15 transition-all";

    const stepHeader = (num, label, colorCls, numBg, numText) => (
        <div className={`bg-[#f6faf1] border-b border-[#d4edbe] p-4 flex items-center gap-3`}>
            <div className={`w-8 h-8 rounded-lg ${numBg} flex items-center justify-center font-bold text-sm ${numText}`}>{num}</div>
            <h2 className="text-lg font-bold text-[#2e4d1b]">{label}</h2>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-20 bg-[#f6faf1] min-h-screen p-6">
            <style>{`
                .wf-card { background:#fff; border:1px solid #d4edbe; border-radius:1rem; overflow:hidden; }
                .btn-green { background:linear-gradient(135deg,#79bd4b,#4e8230); color:#fff; border-radius:.5rem; padding:.5rem 1.25rem; font-weight:600; font-size:.875rem; transition:all .2s; }
                .btn-green:hover { box-shadow:0 4px 14px rgba(121,189,75,.3); }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/assignments')} className="p-2 hover:bg-white border border-transparent hover:border-[#d4edbe] rounded-lg transition-all">
                        <ArrowLeft className="w-6 h-6 text-[#4e8230]" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#2e4d1b]">Workflow Console</h1>
                        <p className="text-sm text-[#4e8230]">Assignment #{id.slice(-6).toUpperCase()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {assignment.status === 'completed' && (
                        <button
                            onClick={handleDownloadInvoice}
                            className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-md shadow-green-500/20"
                        >
                            <Download className="w-4 h-4" /> Download Invoice
                        </button>
                    )}
                    <button onClick={handleDeleteAssignment} className="px-4 py-2 bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>

            {/* ── Invoice Preview Modal ── */}
            {showInvoicePreview && assignment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#f1f5f9] rounded-2xl max-w-[850px] w-full my-8 relative shadow-2xl animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-200 flex items-center justify-between rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Invoice Preview</h2>
                                <p className="text-xs text-slate-500 font-medium">Review the invoice details before downloading</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleActualDownload}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-600/20 active:scale-95"
                                >
                                    <Download className="w-4 h-4" /> Download PDF
                                </button>
                                <button
                                    onClick={() => setShowInvoicePreview(false)}
                                    className="p-2.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all border border-transparent hover:border-slate-200"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Scrollable Area for Invoice */}
                        <div className="p-8 flex justify-center bg-slate-100 overflow-y-auto max-h-[70vh]">
                            <div className="transform scale-[0.85] origin-top shadow-2xl">
                                <AssignmentInvoice
                                    assignment={assignment}
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-white border-t border-slate-200 flex justify-center rounded-b-2xl">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                                All information shown is based on current assignment records
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden component for printing */}
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                <AssignmentInvoice
                    assignment={printingAssignment}
                    invoiceRef={invoiceRef}
                />
            </div>

            {/* Info Card */}
            <div className="wf-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h3 className="text-[10px] font-bold text-[#7aac52] uppercase tracking-wider mb-2">Customer</h3>
                    <p className="text-[#1a2e0e] font-semibold flex items-center gap-2"><User className="w-4 h-4 text-[#79bd4b]" />{customer.fullName || 'N/A'}</p>
                    <p className="text-sm text-[#4e8230] mt-1">{customer.mobileNumber}</p>
                    <p className="text-sm text-[#4e8230] flex items-start gap-1 mt-1">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                        <a href={customer.googleMapLink} target="_blank" rel="noopener noreferrer" className="text-[#79bd4b] hover:underline break-all">{customer.googleMapLink || 'No link'}</a>
                    </p>
                </div>
                <div>
                    <h3 className="text-[10px] font-bold text-[#7aac52] uppercase tracking-wider mb-2">Technician</h3>
                    <p className="text-[#1a2e0e] font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#79bd4b]" />{technician.fullName || 'Unassigned'}</p>
                    <p className="text-sm text-[#4e8230]">{technician.email}</p>
                </div>
                <div>
                    <h3 className="text-[10px] font-bold text-[#7aac52] uppercase tracking-wider mb-2">Booking</h3>
                    <p className="text-[#1a2e0e] font-semibold">{booking.serviceId?.title || 'General Service'}</p>
                    <p className="text-sm text-[#4e8230]">Status: <span className="text-[#79bd4b] font-bold uppercase">{assignment.status}</span></p>
                </div>
            </div>

            {/* Step 1: Preparation */}
            <div className="wf-card">
                {stepHeader(1, 'Treatment Preparation', '', 'bg-[#d4edbe]', 'text-[#2e4d1b]')}
                <div className="p-6">
                    <div className="space-y-2 mb-5">
                        {!assignment.treatmentPreparation?.length && <p className="text-[#a0d073] italic text-sm">No preparation items added.</p>}
                        {assignment.treatmentPreparation?.map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-3 bg-[#f6faf1] rounded-lg border border-[#d4edbe]">
                                <p className="text-[#1a2e0e] text-sm font-medium">{item.chemicals} <span className="text-[#7aac52] font-normal">({item.quantity})</span></p>
                                <button onClick={() => handleDeletePrep(item._id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleAddPrep} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#f6faf1] p-4 rounded-xl border border-[#d4edbe]">
                        <input placeholder="Chemical Name" className={inputCls} value={prepForm.chemicals} onChange={(e) => setPrepForm({ ...prepForm, chemicals: e.target.value })} required />
                        <input placeholder="Quantity (e.g. 500ml)" className={inputCls} value={prepForm.quantity} onChange={(e) => setPrepForm({ ...prepForm, quantity: e.target.value })} required />
                        <button type="submit" className="btn-green">Add Item</button>
                    </form>
                </div>
            </div>

            {/* Step 2: Site Pictures */}
            <div className="wf-card">
                {stepHeader(2, 'Site Pictures', '', 'bg-[#dbeafe]', 'text-[#1d4ed8]')}
                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                        {!assignment.applyTreatment?.sitePictures?.length && <p className="col-span-4 text-[#a0d073] italic text-sm">No pictures uploaded.</p>}
                        {assignment.applyTreatment?.sitePictures?.map((pic) => (
                            <div key={pic._id} className="relative group aspect-square rounded-xl overflow-hidden border border-[#d4edbe]">
                                <img src={pic.url} alt="Site" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => handleDeletePicture(pic._id)} className="bg-red-500 text-white p-2 rounded-full"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleUploadPicture} className="flex gap-4 bg-[#f6faf1] p-4 rounded-xl border border-[#d4edbe] items-center">
                        <input id="file-upload" type="file" accept="image/*" onChange={(e) => setPictureFile(e.target.files[0])}
                            className="text-[#1a2e0e] text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#d4edbe] file:text-[#2e4d1b] hover:file:bg-[#c5e4a3] file:cursor-pointer" />
                        <button type="submit" disabled={!pictureFile} className="btn-green disabled:opacity-50 disabled:cursor-not-allowed">Upload</button>
                    </form>
                </div>
            </div>

            {/* Step 3: Service Execution */}
            <div className="wf-card">
                {stepHeader(3, 'Service Execution', '', 'bg-[#fef3c7]', 'text-[#92400e]')}
                <div className="p-6">
                    <div className="space-y-3">
                        {!booking.subServiceIds?.length && <p className="text-[#a0d073] italic text-sm">No services listed.</p>}
                        {booking.subServiceIds?.map((subItem, idx) => {
                            const svc = subItem.serviceId || {};
                            const done = subItem.status === 'completed';
                            return (
                                <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${done ? 'bg-[#f6faf1] border-[#79bd4b]/40' : 'bg-white border-[#d4edbe]'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-[#f6faf1] border border-[#d4edbe] overflow-hidden flex-shrink-0">
                                            {svc.metaImage || svc.image
                                                ? <img src={svc.metaImage || svc.image} alt={svc.title} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center"><Beaker className="w-5 h-5 text-[#a0d073]" /></div>}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[#1a2e0e] text-sm">{svc.title || 'Unknown Service'}</h3>
                                            <p className="text-xs text-[#4e8230]">₹{svc.startingPrice}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleServiceStatusUpdate(subItem._id, subItem.status)}
                                        className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${done ? 'bg-[#d4edbe] text-[#2e4d1b] hover:bg-[#c5e4a3]' : 'bg-white border border-[#d4edbe] text-[#7aac52] hover:border-[#79bd4b] hover:text-[#2e4d1b]'}`}>
                                        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />}
                                        {done ? 'Completed' : 'Mark Done'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Step 4: Payments */}
            <div className="wf-card">
                {stepHeader(4, 'Payment Collection', '', 'bg-[#d4edbe]', 'text-[#2e4d1b]')}
                <div className="p-6">
                    <div className="space-y-2 mb-5">
                        {(!assignment.paymentCollection?.amount) && <p className="text-[#a0d073] italic text-sm">No payments recorded.</p>}
                        {assignment.paymentCollection?.amount > 0 && (
                            <div className="flex items-center justify-between p-3 bg-[#f6faf1] rounded-lg border border-[#d4edbe]">
                                <div>
                                    <p className="text-[#2e4d1b] font-bold flex items-center gap-2">
                                        <span className="text-[#4e8230] text-lg">₹{assignment.paymentCollection.amount}</span>
                                        <span className="text-xs bg-white px-2 py-0.5 rounded-lg border border-[#d4edbe] capitalize">{assignment.paymentCollection.paymentMethod}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded capitalize ${assignment.paymentCollection.paymentStatus === 'completed' ? 'bg-[#d4edbe] text-[#2e4d1b]' : 'bg-yellow-50 text-yellow-600'}`}>
                                            {assignment.paymentCollection.paymentStatus}
                                        </span>
                                    </p>
                                    <p className="text-xs text-[#7aac52] mt-1">{new Date(assignment.paymentCollection.paymentDate || Date.now()).toLocaleDateString()}</p>
                                </div>
                                <button onClick={handleDeletePayment} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleAddPayment} className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#f6faf1] p-4 rounded-xl border border-[#d4edbe]">
                        <input type="number" placeholder="Amount (₹)" className={inputCls} value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} required />
                        <select className={inputCls} value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}>
                            {['cash', 'card', 'online', 'upi'].map((o) => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                        </select>
                        <button type="submit" className="btn-green">
                            {assignment.paymentCollection?.amount > 0 ? 'Update Payment' : 'Record Payment'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignmentWorkflow;