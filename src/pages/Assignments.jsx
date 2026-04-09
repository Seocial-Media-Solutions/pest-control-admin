import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList, Plus, Search, Edit, Trash2, Eye, Loader2,
    User, ReceiptIndianRupee, Calendar, MapPin, Phone, Mail,
    Beaker, Camera, CheckCircle2, XCircle, Clock, Download,
} from 'lucide-react';
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import AssignmentInvoice from '../components/AssignmentInvoice';
import { useRef } from 'react';
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
    const [assignments, setAssignments] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showTreatmentModal, setShowTreatmentModal] = useState(false);
    const [showPictureModal, setShowPictureModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [printingAssignment, setPrintingAssignment] = useState(null);
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);
    const [selectedInvoiceAssignment, setSelectedInvoiceAssignment] = useState(null);
    const invoiceRef = useRef(null);

    const [treatmentForm, setTreatmentForm] = useState({ chemicals: '', quantity: '', instructions: '' });
    const [pictureForm, setPictureForm] = useState({ file: null });
    const [paymentForm, setPaymentForm] = useState({
        amount: 0, paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'pending',
    });

    const fetchAssignments = useCallback(async () => {
        try { setLoading(true); const data = await getAllAssignments(); setAssignments(data.data || []); }
        catch { toast.error('Failed to fetch assignments'); }
        finally { setLoading(false); }
    }, []);

    const fetchTechnicians = useCallback(async () => {
        try { const data = await getAllTechnicians(); setTechnicians(data.data || []); } catch { /* Ignore */ }
    }, []);

    useEffect(() => {
        fetchAssignments();
        fetchTechnicians();
    }, [fetchAssignments, fetchTechnicians]);

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

    const handleDownloadInvoice = (assignment) => {
        if (!assignment) return;
        setSelectedInvoiceAssignment(assignment);
        setShowInvoicePreview(true);
    };

    const handleActualDownload = (assignment) => {
        if (!assignment) return;
        setPrintingAssignment(assignment);

        // Wait for state update to reflect in template
        setTimeout(() => {
            const element = invoiceRef.current;
            if (!element) {
                toast.error('Template not ready. Please try again.');
                return;
            }

            const opt = {
                margin: 0,
                filename: `Invoice-${assignment._id.slice(-6).toUpperCase()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 1,
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    windowWidth: 794 // Exact A4 width
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
        }, 300); // Increased delay for stability
    };

    const filteredAssignments = assignments.filter((a) => {
        const customer = a.bookingId?.customerId;
        return (
            (customer?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (customer?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (customer?.mobileNumber || '').includes(searchQuery)
        );
    });
    const getCardTheme = (status, createdAt) => {
        const diffDays = Math.floor((Date.now() - new Date(createdAt)) / 86_400_000);

        switch (status?.toLowerCase()) {
            case 'completed':
                return {
                    cardBg: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
                    cardBorder: '#86efac',
                    cardShadow: '0 4px 20px rgba(34,197,94,0.12)',
                    headerAccent: '#15803d',
                    badgeBg: 'rgba(21,128,61,0.12)',
                    badgeText: '#15803d',
                    badgeBorder: '#86efac',
                    sectionBg: 'rgba(255,255,255,0.65)',
                    sectionBorder: '#bbf7d0',
                    techBg: 'rgba(187,247,208,0.6)',
                    techText: '#14532d',
                    iconColor: '#16a34a',
                    labelColor: '#166534',
                    valueColor: '#15803d',
                    metaColor: '#4ade80',
                    idColor: '#14532d',
                    btnBg: 'rgba(255,255,255,0.7)',
                    btnBorder: '#86efac',
                    btnHoverBorder: '#4ade80',
                    btnText: '#14532d',
                    dot: '#22c55e',
                    label: 'Completed',
                };
            case 'in_progress':
                return {
                    cardBg: 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)',
                    cardBorder: '#fcd34d',
                    cardShadow: '0 4px 20px rgba(234,179,8,0.14)',
                    headerAccent: '#92400e',
                    badgeBg: 'rgba(146,64,14,0.1)',
                    badgeText: '#92400e',
                    badgeBorder: '#fcd34d',
                    sectionBg: 'rgba(255,255,255,0.65)',
                    sectionBorder: '#fde68a',
                    techBg: 'rgba(253,230,138,0.6)',
                    techText: '#78350f',
                    iconColor: '#d97706',
                    labelColor: '#92400e',
                    valueColor: '#b45309',
                    metaColor: '#fbbf24',
                    idColor: '#78350f',
                    btnBg: 'rgba(255,255,255,0.7)',
                    btnBorder: '#fcd34d',
                    btnHoverBorder: '#f59e0b',
                    btnText: '#78350f',
                    dot: '#f59e0b',
                    label: 'In Progress',
                };
            case 'pending': {
                // Escalating red urgency
                const urg = diffDays <= 1 ? 0 : diffDays <= 3 ? 1 : diffDays <= 5 ? 2 : diffDays <= 7 ? 3 : 4;
                const urgMap = [
                    { cardBg: 'linear-gradient(145deg,#fef2f2 0%,#fee2e2 100%)', cardBorder: '#fca5a5', cardShadow: '0 4px 20px rgba(239,68,68,0.08)', headerAccent: '#9f1239', badgeBg: 'rgba(159,18,57,0.08)', badgeText: '#ff0048ff', badgeBorder: '#fca5a5', sectionBg: 'rgba(255,255,255,0.65)', sectionBorder: '#fecdd3', techBg: 'rgba(254,205,211,0.6)', techText: '#881337', iconColor: '#ef4444', labelColor: '#9f1239', valueColor: '#dc2626', metaColor: '#f87171', idColor: '#881337', btnBg: 'rgba(255,255,255,0.7)', btnBorder: '#fca5a5', btnHoverBorder: '#f87171', btnText: '#881337', dot: '#ef4444', label: 'Pending' },
                    { cardBg: 'linear-gradient(145deg,#fff1f2 0%,#ffdde0 100%)', cardBorder: '#f87171', cardShadow: '0 4px 20px rgba(239,68,68,0.13)', headerAccent: '#9f1239', badgeBg: 'rgba(239,68,68,0.12)', badgeText: '#991b1b', badgeBorder: '#f87171', sectionBg: 'rgba(255,255,255,0.6)', sectionBorder: '#fca5a5', techBg: 'rgba(252,165,165,0.5)', techText: '#7f1d1d', iconColor: '#dc2626', labelColor: '#991b1b', valueColor: '#dc2626', metaColor: '#f87171', idColor: '#7f1d1d', btnBg: 'rgba(255,255,255,0.65)', btnBorder: '#f87171', btnHoverBorder: '#ef4444', btnText: '#7f1d1d', dot: '#dc2626', label: 'Pending · 1d+' },
                    { cardBg: 'linear-gradient(145deg,#ffe8ea 0%,#ffd2d6 100%)', cardBorder: '#ef4444', cardShadow: '0 4px 20px rgba(220,38,38,0.18)', headerAccent: '#7f1d1d', badgeBg: 'rgba(220,38,38,0.15)', badgeText: '#7f1d1d', badgeBorder: '#ef4444', sectionBg: 'rgba(255,255,255,0.55)', sectionBorder: '#f87171', techBg: 'rgba(248,113,113,0.35)', techText: '#7f1d1d', iconColor: '#b91c1c', labelColor: '#7f1d1d', valueColor: '#b91c1c', metaColor: '#ef4444', idColor: '#7f1d1d', btnBg: 'rgba(255,255,255,0.6)', btnBorder: '#ef4444', btnHoverBorder: '#dc2626', btnText: '#7f1d1d', dot: '#b91c1c', label: 'Overdue · 3d+' },
                    { cardBg: 'linear-gradient(145deg,#ffd6d9 0%,#ffc0c5 100%)', cardBorder: '#dc2626', cardShadow: '0 4px 20px rgba(185,28,28,0.22)', headerAccent: '#7f1d1d', badgeBg: 'rgba(185,28,28,0.18)', badgeText: '#fff', badgeBorder: '#dc2626', sectionBg: 'rgba(255,255,255,0.5)', sectionBorder: '#ef4444', techBg: 'rgba(239,68,68,0.3)', techText: '#fff', iconColor: '#b91c1c', labelColor: '#fff', valueColor: '#fff', metaColor: 'rgba(255,255,255,0.7)', idColor: '#fff', btnBg: 'rgba(255,255,255,0.55)', btnBorder: '#dc2626', btnHoverBorder: '#b91c1c', btnText: '#7f1d1d', dot: '#ef4444', label: 'Overdue · 5d+' },
                    { cardBg: 'linear-gradient(145deg,#7f1d1d 0%,#991b1b 100%)', cardBorder: '#b91c1c', cardShadow: '0 4px 24px rgba(127,29,29,0.40)', headerAccent: '#fca5a5', badgeBg: 'rgba(255,255,255,0.15)', badgeText: '#fff', badgeBorder: 'rgba(255,255,255,0.3)', sectionBg: 'rgba(0,0,0,0.12)', sectionBorder: 'rgba(255,255,255,0.15)', techBg: 'rgba(255,255,255,0.12)', techText: '#fff', iconColor: '#fca5a5', labelColor: 'rgba(255,255,255,0.7)', valueColor: '#fca5a5', metaColor: 'rgba(255,255,255,0.5)', idColor: '#fff', btnBg: 'rgba(255,255,255,0.12)', btnBorder: 'rgba(255,255,255,0.25)', btnHoverBorder: 'rgba(255,255,255,0.5)', btnText: '#fff', dot: '#fca5a5', label: 'CRITICAL · 7d+' },
                ];
                return urgMap[urg];
            }
            default:
                return {
                    cardBg: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
                    cardBorder: '#cbd5e1',
                    cardShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    headerAccent: '#475569',
                    badgeBg: 'rgba(71,85,105,0.1)',
                    badgeText: '#475569',
                    badgeBorder: '#cbd5e1',
                    sectionBg: 'rgba(255,255,255,0.7)',
                    sectionBorder: '#e2e8f0',
                    techBg: 'rgba(226,232,240,0.6)',
                    techText: '#334155',
                    iconColor: '#64748b',
                    labelColor: '#475569',
                    valueColor: '#334155',
                    metaColor: '#94a3b8',
                    idColor: '#334155',
                    btnBg: 'rgba(255,255,255,0.7)',
                    btnBorder: '#cbd5e1',
                    btnHoverBorder: '#94a3b8',
                    btnText: '#334155',
                    dot: '#94a3b8',
                    label: status || 'Unknown',
                };
        }
    };
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


            <>
                <style>{`
    @keyframes acFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes acPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(.8)} }
    @keyframes acShimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
    .ac-card { animation: acFadeUp .3s ease both; }
    .ac-card:hover { transform: translateY(-3px) !important; }
    .ac-workflow-btn:hover { transform: translateY(-1px); }
`}</style>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {filteredAssignments.map((assignment, idx) => {
                        const th = getCardTheme(assignment.status, assignment.createdAt);
                        const isCritical = assignment.status?.toLowerCase() === 'pending' &&
                            Math.floor((Date.now() - new Date(assignment.createdAt)) / 86_400_000) > 7;

                        return (
                            <div
                                key={assignment._id}
                                className="ac-card"
                                style={{
                                    animationDelay: `${idx * 50}ms`,
                                    background: th.cardBg,
                                    border: `1.5px solid ${th.cardBorder}`,
                                    borderRadius: 18,
                                    boxShadow: th.cardShadow,
                                    overflow: 'hidden',
                                    transition: 'transform .2s ease, box-shadow .2s ease',
                                    position: 'relative',
                                }}
                            >
                                {/* Critical shimmer effect */}
                                {isCritical && (
                                    <div style={{
                                        position: 'absolute', inset: 0, overflow: 'hidden',
                                        borderRadius: 18, pointerEvents: 'none', zIndex: 0
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                                            background: 'linear-gradient(90deg,transparent,rgba(252,165,165,0.8),transparent)',
                                            animation: 'acShimmer 2.5s ease-in-out infinite'
                                        }} />
                                    </div>
                                )}

                                <div style={{ padding: '18px 18px 16px', position: 'relative', zIndex: 1 }}>

                                    {/* ── Card header ── */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {/* Status badge */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{
                                                    width: 7, height: 7, borderRadius: '50%',
                                                    background: th.dot, display: 'inline-block',
                                                    animation: assignment.status === 'in_progress' ? 'acPulse 1.8s infinite' : 'none',
                                                    boxShadow: `0 0 0 3px ${th.dot}30`
                                                }} />
                                                <span style={{
                                                    fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                                                    textTransform: 'uppercase', padding: '2px 9px', borderRadius: 20,
                                                    background: th.badgeBg, color: th.badgeText,
                                                    border: `1px solid ${th.badgeBorder}`,
                                                }}>
                                                    {th.label}
                                                </span>
                                            </div>

                                            <h3 style={{
                                                fontSize: 15, fontWeight: 800, color: th.idColor,
                                                margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2
                                            }}>
                                                Assignment <span style={{ fontFamily: 'monospace', fontSize: 13 }}>
                                                    #{assignment._id.slice(-6).toUpperCase()}
                                                </span>
                                            </h3>
                                            <p style={{ fontSize: 11, color: th.metaColor, margin: 0 }}>
                                                {new Date(assignment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteAssignment(assignment._id)}
                                            style={{
                                                padding: '7px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                                background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all .15s ease', flexShrink: 0
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                                            title="Delete assignment"
                                        >
                                            <Trash2 style={{ width: 15, height: 15 }} />
                                        </button>
                                    </div>

                                    {/* ── Customer section ── */}
                                    {assignment.bookingId?.customerId && (
                                        <div style={{
                                            background: th.sectionBg, borderRadius: 12,
                                            border: `1px solid ${th.sectionBorder}`,
                                            padding: '10px 12px', marginBottom: 10,
                                            backdropFilter: 'blur(4px)'
                                        }}>
                                            <p style={{
                                                fontSize: 9, fontWeight: 800, color: th.labelColor,
                                                textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 7px'
                                            }}>Customer</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                                {[
                                                    { Icon: User, val: assignment.bookingId.customerId.fullName },
                                                    { Icon: Phone, val: assignment.bookingId.customerId.mobileNo || 'N/A' },
                                                    { Icon: Mail, val: assignment.bookingId.customerId.email },
                                                ].map((item) => (
                                                    <div key={item.val} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                        <item.Icon style={{ width: 13, height: 13, color: th.iconColor, flexShrink: 0 }} />
                                                        <span style={{ fontSize: 12, color: th.idColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {item.val}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Technician / assign ── */}
                                    {assignment.technicianId ? (
                                        <div style={{
                                            background: th.techBg, borderRadius: 10,
                                            padding: '8px 12px', marginBottom: 10,
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            border: `1px solid ${th.sectionBorder}`
                                        }}>
                                            <div style={{
                                                width: 26, height: 26, borderRadius: '50%',
                                                background: th.iconColor,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 11, fontWeight: 900, color: '#fff', flexShrink: 0
                                            }}>
                                                {(assignment.technicianId.fullName || '?')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: th.labelColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                    Assigned Technician
                                                </p>
                                                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: th.techText }}>
                                                    {assignment.technicianId.fullName}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ marginBottom: 10, position: 'relative' }}>
                                            <select
                                                onChange={(e) => handleAssignTechnician(assignment._id, e.target.value)}
                                                defaultValue=""
                                                style={{
                                                    width: '100%', padding: '8px 32px 8px 12px',
                                                    background: th.sectionBg, border: `1.5px dashed ${th.cardBorder}`,
                                                    borderRadius: 10, fontSize: 12, color: th.idColor,
                                                    cursor: 'pointer', appearance: 'none',
                                                    outline: 'none', fontWeight: 600,
                                                }}
                                            >
                                                <option value="" disabled>⚡ Assign Technician</option>
                                                {technicians.map((t) => (
                                                    <option key={t._id} value={t._id}>{t.fullName}</option>
                                                ))}
                                            </select>
                                            <div style={{
                                                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                                pointerEvents: 'none', color: th.iconColor, fontSize: 12
                                            }}>▾</div>
                                        </div>
                                    )}

                                    {/* ── Workflow progress ── */}
                                    <div style={{
                                        background: th.sectionBg, borderRadius: 12,
                                        border: `1px solid ${th.sectionBorder}`,
                                        padding: '10px 12px', marginBottom: 12,
                                        display: 'flex', flexDirection: 'column', gap: 7,
                                        backdropFilter: 'blur(4px)'
                                    }}>
                                        <p style={{
                                            fontSize: 9, fontWeight: 800, color: th.labelColor,
                                            textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px'
                                        }}>Progress</p>
                                        {[
                                            { Icon: Beaker, label: 'Treatment Prep', val: `${assignment.treatmentPreparation?.length || 0} items` },
                                            { Icon: Camera, label: 'Site Pictures', val: `${assignment.applyTreatment?.sitePictures?.length || 0} photos` },
                                            { Icon: ReceiptIndianRupee, label: 'Payments', val: `₹${assignment.paymentCollection?.amount || 0}` },
                                        ].map(({ Icon, label, val }) => (
                                            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <Icon style={{ width: 12, height: 12, color: th.iconColor }} />
                                                    <span style={{ fontSize: 11, color: th.labelColor, fontWeight: 600 }}>{label}</span>
                                                </div>
                                                <span style={{
                                                    fontSize: 11, fontWeight: 800, color: th.valueColor,
                                                    background: th.badgeBg, padding: '1px 8px',
                                                    borderRadius: 20, border: `1px solid ${th.sectionBorder}`
                                                }}>{val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ── Open workflow button ── */}
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            className="ac-workflow-btn"
                                            onClick={() => navigate(`/assignments/${assignment._id}/workflow`)}
                                            style={{
                                                flex: 1, display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', gap: 7,
                                                padding: '9px 12px',
                                                background: th.btnBg,
                                                border: `1.5px solid ${th.btnBorder}`,
                                                borderRadius: 12, cursor: 'pointer',
                                                fontSize: 12, fontWeight: 800, color: th.btnText,
                                                transition: 'all .15s ease',
                                                backdropFilter: 'blur(4px)',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.borderColor = th.btnHoverBorder;
                                                e.currentTarget.style.boxShadow = `0 4px 14px ${th.dot}30`;
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.borderColor = th.btnBorder;
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <ClipboardList style={{ width: 14, height: 14 }} />
                                            Workflow
                                        </button>

                                        {assignment.status === 'completed' && (
                                            <button
                                                onClick={() => handleDownloadInvoice(assignment)}
                                                style={{
                                                    padding: '9px 12px',
                                                    background: 'rgba(34,197,94,0.1)',
                                                    border: '1.5px solid #22c55e',
                                                    borderRadius: 12, cursor: 'pointer',
                                                    color: '#15803d',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: 'all .15s ease'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.background = 'rgba(34,197,94,0.2)';
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.background = 'rgba(34,197,94,0.1)';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                                title="Download Invoice"
                                            >
                                                <Download style={{ width: 14, height: 14 }} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>

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
                                    <h3 className="text-base font-bold text-[#2e4d1b] flex items-center gap-2"><ReceiptIndianRupee className="w-4 h-4 text-[#79bd4b]" />Step 3: Payment Collection</h3>
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
                                { label: 'Payment Method *', key: 'paymentMethod', options: ['cash', 'card', 'upi', 'bank_transfer', 'other'] },
                                { label: 'Payment Status *', key: 'paymentStatus', options: ['pending', 'completed', 'failed'] },
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
            {/* ── Invoice Preview Modal ── */}
            {showInvoicePreview && selectedInvoiceAssignment && (
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
                                    onClick={() => handleActualDownload(selectedInvoiceAssignment)}
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
                                    assignment={selectedInvoiceAssignment}
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
        </div>
    );
};

export default Assignments;
