import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bug, Plus, Search, Edit, Trash2, Loader2,
  ReceiptIndianRupee, Image as ImageIcon, AlertTriangle,
  CheckCircle, XCircle, Layers, Sparkles, X
} from 'lucide-react';
import { useServices } from '../context/ServiceContext';
import { useSearch } from '../context/SearchContext';
import toast from 'react-hot-toast';

const PRIMARY = "#74bc4c";

// ─── Toast Helpers ────────────────────────────────────────────────────────────
const ts = (shadow = "0 8px 32px rgba(0,0,0,0.10)") => ({
  padding: "10px 14px", borderRadius: "14px", boxShadow: shadow,
  fontFamily: "'Plus Jakarta Sans', sans-serif"
});
const richToast = {
  loading: (title, sub) => toast.loading(
    <div className="flex items-center gap-3">
      <Loader2 size={15} className="animate-spin shrink-0" style={{ color: PRIMARY }} />
      <div><p className="font-semibold text-gray-800 text-sm">{title}</p><p className="text-xs text-gray-400">{sub}</p></div>
    </div>, { style: ts() }
  ),
  success: (id, title, sub) => toast.success(
    <div className="flex items-center gap-3">
      <CheckCircle size={15} className="shrink-0" style={{ color: PRIMARY }} />
      <div><p className="font-semibold text-gray-800 text-sm">{title}</p><p className="text-xs text-gray-400">{sub}</p></div>
    </div>, { id, duration: 3000, style: ts("0 8px 32px rgba(116,188,76,0.18)") }
  ),
  error: (id, title, sub) => toast.error(
    <div className="flex items-center gap-3">
      <XCircle size={15} className="shrink-0 text-red-500" />
      <div><p className="font-semibold text-gray-800 text-sm">{title}</p><p className="text-xs text-gray-400">{sub}</p></div>
    </div>, { id, duration: 4000, style: ts() }
  ),
};

function confirmDelete(name, onConfirm) {
  toast((t) => (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <AlertTriangle size={14} className="text-red-500 shrink-0" />
        <p className="font-semibold text-gray-800 text-sm">Delete "{name}"?</p>
      </div>
      <p className="text-xs text-gray-400 mb-3">This action cannot be undone.</p>
      <div className="flex gap-2">
        <button onClick={() => { toast.dismiss(t.id); onConfirm(); }}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
          Delete
        </button>
        <button onClick={() => toast.dismiss(t.id)}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200">
          Cancel
        </button>
      </div>
    </div>
  ), { duration: 8000, style: { ...ts(), minWidth: "210px" } });
}

// ─── Modal Component ──────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}>
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #f0fae8, #e8f5d8)" }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: "linear-gradient(135deg, #74bc4c, #5fa33b)" }}>
              <Layers size={16} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-gray-800">{title}</h2>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        {label} {required && <span style={{ color: PRIMARY }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = `w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm text-gray-800 outline-none
  transition-all duration-200 placeholder:text-gray-300
  focus:border-[#74bc4c] focus:ring-4 focus:ring-[#74bc4c]/10`;

// ─── Main Component ───────────────────────────────────────────────────────────
const Services = () => {
  const navigate = useNavigate();
  const {
    services, loading, error: contextError,
    createService, updateService, deleteService,
    addSubService, updateSubService, deleteSubService
  } = useServices();

  const { searchQuery, setSearchQuery } = useSearch();
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', image: '' });
  const [imageFile, setImageFile] = useState(null);

  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedSubService, setSelectedSubService] = useState(null);
  const [parentServiceId, setParentServiceId] = useState(null);
  const [subForm, setSubForm] = useState({ title: '', description: '', startingPrice: '', image: '' });

  const resetForm = () => { setFormData({ title: '', description: '', image: '' }); setImageFile(null); setSelectedService(null); };
  const resetSubForm = () => { setSubForm({ title: '', description: '', startingPrice: '', image: '' }); setImageFile(null); setSelectedSubService(null); };

  const openEditModal = (service) => {
    setSelectedService(service);
    setFormData({ title: service.title, description: service.description, image: service.image });
    setImageFile(null);
    setShowModal(true);
  };

  const openAddSubModal = (serviceId) => { resetSubForm(); setParentServiceId(serviceId); setShowSubModal(true); };
  const openEditSubModal = (serviceId, sub) => {
    setParentServiceId(serviceId); setSelectedSubService(sub);
    setSubForm({ title: sub.title, description: sub.description, startingPrice: sub.startingPrice, image: sub.image });
    setImageFile(null); setShowSubModal(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = richToast.loading(selectedService ? "Updating service..." : "Creating service...", formData.title);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      if (imageFile) data.append('image', imageFile);
      else if (formData.image) data.append('image', formData.image);
      if (selectedService) await updateService(selectedService._id, data);
      else await createService(data);
      richToast.success(toastId, selectedService ? "Service Updated" : "Service Created", formData.title);
      setShowModal(false); resetForm();
    } catch (err) {
      richToast.error(toastId, "Failed to save", err.response?.data?.message || "Please try again");
    } finally { setIsSaving(false); }
  };

  const handleDeleteService = (id, name) => {
    confirmDelete(name, async () => {
      const tid = richToast.loading("Deleting...", name);
      try {
        await deleteService(id);
        richToast.success(tid, "Service Deleted", name);
      } catch { richToast.error(tid, "Delete Failed", "Could not remove service"); }
    });
  };

  const handleSubServiceSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const tid = richToast.loading(selectedSubService ? "Updating sub-service..." : "Adding sub-service...", subForm.title);
    try {
      const data = new FormData();
      data.append('title', subForm.title);
      data.append('description', subForm.description);
      data.append('startingPrice', subForm.startingPrice);
      if (imageFile) data.append('image', imageFile);
      else if (subForm.image) data.append('image', subForm.image);
      if (selectedSubService) await updateSubService(parentServiceId, selectedSubService._id, data);
      else await addSubService(parentServiceId, data);
      richToast.success(tid, selectedSubService ? "Sub-service Updated" : "Sub-service Added", subForm.title);
      setShowSubModal(false); resetSubForm();
    } catch (err) {
      richToast.error(tid, "Failed to save", err.response?.data?.message || "Please try again");
    } finally { setIsSaving(false); }
  };

  const handleDeleteSubService = (serviceId, subId, name) => {
    confirmDelete(name, async () => {
      const tid = richToast.loading("Deleting...", name);
      try {
        await deleteSubService(serviceId, subId);
        richToast.success(tid, "Sub-service Deleted", name);
      } catch { richToast.error(tid, "Delete Failed", "Could not remove sub-service"); }
    });
  };

  const filteredServices = services.filter(s =>
    s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #74bc4c, #5fa33b)" }}>
          <Loader2 className="text-white animate-spin" size={22} />
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6 pb-24 md:pb-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .svc-page * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .btn-primary { background: linear-gradient(135deg, #74bc4c, #5fa33b); box-shadow: 0 4px 16px rgba(116,188,76,0.32); transition: all 0.2s; }
        .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(116,188,76,0.42); }
        .svc-card { transition: all 0.2s ease; }
        .svc-card:hover { box-shadow: 0 8px 32px rgba(116,188,76,0.10); }
        .sub-card:hover { border-color: rgba(116,188,76,0.4); background: #fafffe; }
        .search-input:focus { border-color: #74bc4c !important; box-shadow: 0 0 0 4px rgba(116,188,76,0.10) !important; }
      `}</style>

      <div className="svc-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl p-5"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: "linear-gradient(135deg, #f0fae8, #dcf5c8)" }}>
              <Bug size={22} style={{ color: PRIMARY }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-800">Services</h1>
                <Sparkles size={14} style={{ color: PRIMARY }} />
              </div>
              <p className="text-xs text-gray-400">
                {loading ? "Loading..." : `${services.length} service${services.length !== 1 ? "s" : ""} configured`}
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/services/create')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold btn-primary w-full md:w-auto">
            <Plus size={16} /> Add Service
          </button>
        </div>

        {/* Error Banner */}
        {contextError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">
            <XCircle size={16} className="shrink-0" /> {contextError}
          </div>
        )}



        {/* Services List */}
        <div className="space-y-4">
          {filteredServices.map((service) => (
            <div key={service._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden svc-card"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>

              {/* Service Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4"
                style={{ background: "linear-gradient(135deg, #f8fdf5, #f2fae9)" }}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                    {service.image
                      ? <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                      : <Bug size={22} style={{ color: PRIMARY }} />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800 capitalize">{service.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5 max-w-xs">{service.description}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                        style={{ background: "rgba(116,188,76,0.12)", color: PRIMARY }}>
                        <Layers size={11} /> {service.services?.length || 0} sub-services
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => openEditModal(service)}
                    className="p-2 rounded-xl text-gray-400 hover:text-[#5fa33b] hover:bg-white transition-all border border-transparent hover:border-gray-100">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeleteService(service._id, service.title)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Sub-services */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-gray-700">Sub-Services</h4>
                  <button onClick={() => openAddSubModal(service._id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border"
                    style={{ color: PRIMARY, borderColor: "rgba(116,188,76,0.3)", background: "rgba(116,188,76,0.06)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(116,188,76,0.14)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(116,188,76,0.06)"; }}>
                    <Plus size={13} /> Add Sub-Service
                  </button>
                </div>

                {service.services?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {service.services.map((sub) => (
                      <div key={sub._id}
                        className="bg-gray-50 border-2 border-gray-100 rounded-xl p-4 flex flex-col justify-between sub-card transition-all duration-200">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            {sub.image
                              ? <img src={sub.image} alt={sub.title} className="w-full h-full object-cover" />
                              : <Bug size={16} className="text-gray-300" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-gray-800 text-sm truncate">{sub.title}</h5>
                            <p className="text-xs font-semibold mt-0.5" style={{ color: PRIMARY }}>
                              ₹{sub.startingPrice} starting
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{sub.description}</p>
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                          <button onClick={() => openEditSubModal(service._id, sub)}
                            className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:text-[#5fa33b] hover:border-[#74bc4c]/40 hover:bg-[#f0fae8] transition-all">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteSubService(service._id, sub._id, sub.title)}
                            className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-xl border-2 border-dashed border-gray-100">
                    <Bug size={22} className="mx-auto mb-2 text-gray-200" />
                    <p className="text-xs font-medium text-gray-400">No sub-services yet</p>
                    <p className="text-xs text-gray-300 mt-0.5">Click "Add Sub-Service" to get started</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "linear-gradient(135deg, #f0fae8, #dcf5c8)" }}>
              <Bug size={28} style={{ color: PRIMARY }} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No services found</h3>
            <p className="text-sm text-gray-400 mb-5">
              {searchQuery ? "Try adjusting your search terms" : "Create your first service to get started"}
            </p>
            <button onClick={() => navigate('/services/create')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold btn-primary">
              <Plus size={16} /> Add Service
            </button>
          </div>
        )}

        {/* ── Service Modal ── */}
        {showModal && (
          <Modal title={selectedService ? "Edit Service" : "Add New Service"} onClose={() => { setShowModal(false); resetForm(); }}>
            <form onSubmit={handleServiceSubmit} className="p-6 space-y-4">
              <Field label="Service Title" required>
                <input type="text" value={formData.title} required
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className={inputCls} placeholder="e.g. Pest Control" />
              </Field>
              <Field label="Description" required>
                <textarea value={formData.description} rows={3} required
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className={inputCls} placeholder="Describe this service..." />
              </Field>
              <Field label="Service Image">
                {(imageFile || formData.image) && (
                  <div className="w-full h-36 bg-gray-50 border-2 border-gray-100 rounded-xl overflow-hidden flex items-center justify-center mb-3">
                    <img src={imageFile ? URL.createObjectURL(imageFile) : formData.image} alt="Preview" className="h-full object-contain" />
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#74bc4c]/50 hover:bg-[#f8fdf5] transition-all text-sm text-gray-400 font-medium">
                  <ImageIcon size={16} style={{ color: PRIMARY }} />
                  {imageFile ? imageFile.name : "Choose Image"}
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="hidden" />
                </label>
              </Field>
              <div className="flex gap-3 pt-2">
                <button type="button" disabled={isSaving}
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-bold btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                  {isSaving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : (selectedService ? "Update Service" : "Create Service")}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ── Sub-Service Modal ── */}
        {showSubModal && (
          <Modal title={selectedSubService ? "Edit Sub-Service" : "Add Sub-Service"} onClose={() => { setShowSubModal(false); resetSubForm(); }}>
            <form onSubmit={handleSubServiceSubmit} className="p-6 space-y-4">
              <Field label="Sub-Service Title" required>
                <input type="text" value={subForm.title} required
                  onChange={e => setSubForm({ ...subForm, title: e.target.value })}
                  className={inputCls} placeholder="e.g. Termite Treatment" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Starting Price (₹)" required>
                  <div className="relative">
                    <ReceiptIndianRupee size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="number" min="0" value={subForm.startingPrice} required
                      onChange={e => setSubForm({ ...subForm, startingPrice: e.target.value })}
                      className={inputCls + " pl-9"} placeholder="999" />
                  </div>
                </Field>
                <Field label="Image">
                  <label className="flex items-center justify-center gap-1.5 w-full h-[46px] rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#74bc4c]/50 hover:bg-[#f8fdf5] transition-all text-xs text-gray-400 font-medium">
                    <ImageIcon size={14} style={{ color: PRIMARY }} />
                    {imageFile ? "Selected" : "Upload"}
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="hidden" />
                  </label>
                </Field>
              </div>
              {(imageFile || subForm.image) && (
                <div className="w-full h-28 bg-gray-50 border-2 border-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                  <img src={imageFile ? URL.createObjectURL(imageFile) : subForm.image} alt="Preview" className="h-full object-contain" />
                </div>
              )}
              <Field label="Description" required>
                <textarea value={subForm.description} rows={3} required
                  onChange={e => setSubForm({ ...subForm, description: e.target.value })}
                  className={inputCls} placeholder="Describe this sub-service..." />
              </Field>
              <div className="flex gap-3 pt-2">
                <button type="button" disabled={isSaving}
                  onClick={() => { setShowSubModal(false); resetSubForm(); }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-bold btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                  {isSaving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : (selectedSubService ? "Update" : "Add Sub-Service")}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Services;