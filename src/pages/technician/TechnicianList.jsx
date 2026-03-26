import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, UserPlus, Trash2, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Loader2, Calendar, Clock, AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getAllTechnicians, markAttendance } from '../../services/technicianService';
import Toggle from '../../components/Toggle';
import { API_URL } from "../../utils";
import { useSearch } from "../../context/SearchContext";

const PRIMARY = "#74bc4c";

// ─── Rich Toast Helpers ───────────────────────────────────────────────────────
const richToast = {
  loading: (title, sub) =>
    toast.loading(
      <div className="flex items-center gap-3">
        <Loader2 size={15} className="animate-spin shrink-0" style={{ color: PRIMARY }} />
        <div><p className="font-semibold text-gray-800 text-sm">{title}</p><p className="text-xs text-gray-400">{sub}</p></div>
      </div>,
      { style: toastStyle() }
    ),
  success: (id, title, sub) =>
    toast.success(
      <div className="flex items-center gap-3">
        <CheckCircle size={15} className="shrink-0" style={{ color: PRIMARY }} />
        <div><p className="font-semibold text-gray-800 text-sm">{title}</p><p className="text-xs text-gray-400">{sub}</p></div>
      </div>,
      { id, duration: 3000, style: toastStyle("0 8px 32px rgba(116,188,76,0.18)") }
    ),
  error: (id, title, sub) =>
    toast.error(
      <div className="flex items-center gap-3">
        <XCircle size={15} className="shrink-0 text-red-500" />
        <div><p className="font-semibold text-gray-800 text-sm">{title}</p><p className="text-xs text-gray-400">{sub}</p></div>
      </div>,
      { id, duration: 4000, style: toastStyle() }
    ),
};
function toastStyle(shadow = "0 8px 32px rgba(0,0,0,0.10)") {
  return { padding: "10px 14px", borderRadius: "14px", boxShadow: shadow, fontFamily: "'Plus Jakarta Sans', sans-serif" };
}

// ─── Confirm Delete Modal via Toast ──────────────────────────────────────────
function confirmDelete(name, onConfirm) {
  toast(
    (t) => (
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={15} className="text-red-500 shrink-0" />
          <p className="font-semibold text-gray-800 text-sm">Delete {name}?</p>
        </div>
        <p className="text-xs text-gray-400 mb-3">This action cannot be undone.</p>
        <div className="flex gap-2">
          <button
            onClick={() => { toast.dismiss(t.id); onConfirm(); }}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    { duration: 8000, style: { ...toastStyle(), minWidth: "220px" } }
  );
}

export default function TechnicianList() {
  const queryClient = useQueryClient();
  const { searchQuery } = useSearch();
  const [currentPage, setCurrentPage] = useState(1);
  const [markingAttendanceFor, setMarkingAttendanceFor] = useState(null);
  const [isBulkMarking, setIsBulkMarking] = useState(false);
  const pageSize = 10;
  const navigate = useNavigate();

  const handleMarkAllPresent = async () => {
    const activeTechs = technicians.filter(t => t.isActive && t.attendance?.status !== 'Present');
    if (activeTechs.length === 0) {
      return toast.success("All active technicians are already marked present", { style: toastStyle() });
    }

    if (!window.confirm(`Mark ${activeTechs.length} technicians as present for today?`)) return;

    const toastId = richToast.loading("Bulk Marking", `Recording attendance for ${activeTechs.length} technicians...`);
    setIsBulkMarking(true);

    try {
      await Promise.all(activeTechs.map(t => 
        markAttendance(t._id, { status: 'Present', date: new Date().toISOString() })
      ));
      richToast.success(toastId, "Success", `All ${activeTechs.length} active technicians are present.`);
      queryClient.invalidateQueries(['technicians']);
    } catch (err) {
      console.error(err);
      richToast.error(toastId, "Bulk Action Failed", "Something went wrong during bulk marking.");
    } finally {
      setIsBulkMarking(false);
    }
  };

  const { data: technicians = [], isLoading: loading } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const response = await getAllTechnicians();
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnMount: true,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ technicianId, status }) =>
      await markAttendance(technicianId, { status, date: new Date().toISOString() }),
    onMutate: ({ technicianId }) => setMarkingAttendanceFor(technicianId),
    onSuccess: (_, variables) => {
      const tech = technicians.find(t => t._id === variables.technicianId);
      richToast.success(undefined,
        `Marked ${variables.status}`,
        tech?.fullName || "Technician"
      );
      queryClient.invalidateQueries(['technicians']);
    },
    onError: (error) => richToast.error(undefined, "Failed to mark attendance", error.response?.data?.message || "Please try again"),
    onSettled: () => setMarkingAttendanceFor(null),
  });

  const handleMarkAttendance = (technicianId, isPresent) => {
    if (!technicianId) return;
    markAttendanceMutation.mutate({ technicianId, status: isPresent ? 'Present' : 'Absent' });
  };

  const handleDelete = (id, name) => {
    confirmDelete(name, async () => {
      const toastId = richToast.loading("Deleting...", name);
      try {
        const res = await fetch(`${API_URL}/technicians/${id}`, { method: "DELETE" });
        const result = await res.json();
        if (result.success) {
          richToast.success(toastId, "Technician Deleted", `${name} has been removed.`);
          queryClient.invalidateQueries(['technicians']);
        } else {
          richToast.error(toastId, "Delete Failed", result.message || "Something went wrong");
        }
      } catch {
        richToast.error(toastId, "Server Error", "Could not delete technician");
      }
    });
  };

  const filteredTechnicians = technicians.filter((e) => {
    const q = searchQuery.toLowerCase();
    return e.fullName?.toLowerCase().includes(q) || e.username?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredTechnicians.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTechnicians = filteredTechnicians.slice(startIndex, startIndex + pageSize);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  return (
    <div className="min-h-screen max-w-full mx-auto space-y-5 animate-fade-in">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .tech-page * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .btn-primary-sm {
          background: linear-gradient(135deg, #74bc4c, #5fa33b);
          box-shadow: 0 3px 14px rgba(116,188,76,0.32);
          transition: all 0.2s ease;
        }
        .btn-primary-sm:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(116,188,76,0.40); }
        .row-hover:hover { background: #f8fdf5 !important; }
        .search-focus:focus { border-color: #74bc4c !important; box-shadow: 0 0 0 4px rgba(116,188,76,0.10) !important; }
        .page-btn { transition: all 0.15s ease; }
        .page-btn:hover:not(:disabled) { background: #f0fae8; border-color: #74bc4c; color: #5fa33b; }
        .card-shadow { box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04); }
      `}</style>

      <div className="tech-page">
        {/* ── Header ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: "linear-gradient(135deg, #f0fae8, #dcf5c8)" }}>
              <Users size={22} style={{ color: PRIMARY }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Technician Management</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading ? "Loading..." : `${technicians.length} technician${technicians.length !== 1 ? "s" : ""} registered`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllPresent}
              disabled={isBulkMarking || loading || technicians.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#74bc4c] text-[#74bc4c] text-sm font-semibold hover:bg-[#74bc4c08] transition-all disabled:opacity-50"
            >
              {isBulkMarking ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} 
              Mark All Present
            </button>
            <button
              onClick={() => navigate("/technicians/addtechnician")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold btn-primary-sm"
            >
              <UserPlus size={16} /> Add Technician
            </button>
          </div>
        </div>

      

        {/* ── Table ── */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden card-shadow">

          {/* Desktop */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead>
                <tr style={{ background: "linear-gradient(180deg, #f8fdf5, #f3fbed)" }}>
                  {["Full Name", "Username", "Email", "Contact", "Status", "Today", "Attendance", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="8" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #74bc4c, #5fa33b)" }}>
                        <Loader2 className="text-white animate-spin" size={18} />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">Loading technicians...</p>
                    </div>
                  </td></tr>
                ) : paginatedTechnicians.length === 0 ? (
                  <tr><td colSpan="8" className="py-16 text-center">
                    <Users size={32} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-sm text-gray-400 font-medium">No technicians found</p>
                    {searchQuery && <p className="text-xs text-gray-300 mt-1">Try a different search term</p>}
                  </td></tr>
                ) : (
                  paginatedTechnicians.map((exec) => {
                    const att = exec.attendance;
                    const isPresent = att?.status === 'Present';
                    return (
                      <tr key={exec._id} className="row-hover transition-colors duration-150">
                        <td
                          className="px-5 py-3.5 text-sm font-semibold text-gray-700 cursor-pointer hover:text-[#5fa33b] transition-colors"
                          onClick={() => navigate(`/technician/${exec._id}`)}
                        >
                          {exec.fullName}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-400">@{exec.username}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-400">{exec.email}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-400">{exec.contactNumber}</td>
                        <td className="px-5 py-3.5">
                          {exec.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {att ? (
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${att.status === 'Present' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                {att.status === 'Present' ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                {att.status}
                              </span>
                              <button
                                onClick={() => navigate('/attendance/' + exec._id)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors hover:bg-gray-100"
                                style={{ color: PRIMARY }}
                              >
                                <Calendar size={11} /> Record
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-400 border border-gray-100">
                              <Clock size={11} /> Not Marked
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {markingAttendanceFor === exec._id ? (
                            <Loader2 size={18} className="animate-spin" style={{ color: PRIMARY }} />
                          ) : (
                            <Toggle
                              checked={isPresent}
                              onChange={(v) => handleMarkAttendance(exec._id, v)}
                              disabled={markingAttendanceFor !== null}
                              size="md"
                            />
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(exec._id, exec.fullName); }}
                            className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
            {loading ? (
              <div className="py-12 text-center flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #74bc4c, #5fa33b)" }}>
                  <Loader2 className="text-white animate-spin" size={18} />
                </div>
                <p className="text-sm text-gray-400 font-medium">Loading...</p>
              </div>
            ) : paginatedTechnicians.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={28} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm text-gray-400">No technicians found</p>
              </div>
            ) : (
              paginatedTechnicians.map((exec) => {
                const att = exec.attendance;
                const isPresent = att?.status === 'Present';
                return (
                  <div key={exec._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    {/* Card Top */}
                    <div className="p-4 flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => navigate(`/technician/${exec._id}`)}>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-gray-800 hover:text-[#5fa33b] transition-colors">{exec.fullName}</p>
                          {exec.isActive ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-green-50 text-green-600">
                              <span className="w-1 h-1 rounded-full bg-green-500" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-red-500">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">@{exec.username}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{exec.email}</p>
                        <p className="text-xs text-gray-400">{exec.contactNumber}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(exec._id, exec.fullName); }}
                        className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Card Footer */}
                    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-50" style={{ background: "#f8fdf5" }}>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Today's Attendance</p>
                        <div className="flex items-center gap-2">
                          {att ? (
                            <>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold ${att.status === 'Present' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                {att.status === 'Present' ? <CheckCircle size={10} /> : <XCircle size={10} />} {att.status}
                              </span>
                              <button onClick={() => navigate('/attendance/' + exec._id)} className="text-[11px] font-semibold underline" style={{ color: PRIMARY }}>
                                Record
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white border border-gray-100 text-gray-400">
                              <Clock size={10} /> Not Marked
                            </span>
                          )}
                        </div>
                      </div>
                      {markingAttendanceFor === exec._id ? (
                        <Loader2 size={18} className="animate-spin" style={{ color: PRIMARY }} />
                      ) : (
                        <Toggle
                          checked={isPresent}
                          onChange={(v) => handleMarkAttendance(exec._id, v)}
                          disabled={markingAttendanceFor !== null}
                          size="sm"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

              {/* Pagination */}
              <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between bg-white">
                <p className="text-xs text-gray-400 font-medium">
                  {filteredTechnicians.length > 0
                    ? `Showing ${startIndex + 1}–${Math.min(startIndex + pageSize, filteredTechnicians.length)} of ${filteredTechnicians.length}`
                    : "No results"}
                </p>
                <div className="flex items-center gap-1.5">
                  {[
                    { icon: ChevronsLeft, action: () => setCurrentPage(1), disabled: currentPage === 1 },
                    { icon: ChevronLeft, action: () => setCurrentPage(p => Math.max(1, p - 1)), disabled: currentPage === 1 },
                    { icon: ChevronRight, action: () => setCurrentPage(p => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages },
                    { icon: ChevronsRight, action: () => setCurrentPage(totalPages), disabled: currentPage === totalPages },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      disabled={item.disabled}
                      className="p-1.5 rounded-lg border border-gray-100 text-gray-400 disabled:opacity-30 page-btn"
                    >
                      <item.icon size={15} />
                    </button>
                  ))}
                  <span className="px-3 py-1.5 text-xs font-semibold text-gray-500">
                    {currentPage} / {totalPages || 1}
                  </span>
                </div>
              </div>
        </div>
      </div>
    </div>
  );
}