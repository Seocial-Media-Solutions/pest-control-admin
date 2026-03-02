import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  UserPlus,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Calendar,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getAllTechnicians, markAttendance } from '../../services/technicianService';
import Toggle from '../../components/Toggle';
import { API_URL } from "../../utils";

export default function TechnicianList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [markingAttendanceFor, setMarkingAttendanceFor] = useState(null);
  const pageSize = 10; // technicians per page
  const navigate = useNavigate();

  // Fetch all technicians using TanStack Query
  const {
    data: technicians = [],
    isLoading: loading,
    refetch: fetchTechnicians
  } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const response = await getAllTechnicians();
      return response.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: true,
  });

  // Mutation for marking attendance
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ technicianId, status }) => {
      return await markAttendance(technicianId, {
        status,
        date: new Date().toISOString()
      });
    },
    onMutate: async ({ technicianId }) => {
      setMarkingAttendanceFor(technicianId);
    },
    onSuccess: (data, variables) => {
      const technician = technicians.find(t => t._id === variables.technicianId);
      toast.success(`Attendance marked as ${variables.status} for ${technician?.fullName || 'technician'}`);

      // Invalidate and refetch
      queryClient.invalidateQueries(['technicians']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    },
    onSettled: () => {
      setMarkingAttendanceFor(null);
    }
  });

  const handleMarkAttendance = (technicianId, isPresent) => {
    if (!technicianId) return;
    const status = isPresent ? 'Present' : 'Absent';
    markAttendanceMutation.mutate({ technicianId, status });
  };

  // Delete technician
  const handleDelete = async (id) => {
    toast((t) => (
      <div>
        <p className="text-sm mb-2">Are you sure you want to delete?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const res = await fetch(`${API_URL}/technicians/${id}`,
                  { method: "DELETE" }
                );
                const result = await res.json();
                if (result.success) {
                  toast.success("Technician deleted");
                  queryClient.invalidateQueries(['technicians']);
                } else {
                  toast.error(result.message || "Delete failed");
                }
              } catch {
                toast.error("Server error while deleting");
              }
              toast.dismiss(t.id);
            }}
            className="bg-red-600 text-white px-3 py-1 rounded-md text-xs"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 px-3 py-1 rounded-md text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  // Edit technician
  const handleEdit = (exec) => {
    navigate(`/technician/${exec._id}`);
  };

  // Filter (search)
  const filteredTechnicians = technicians.filter((e) => {
    const query = search.toLowerCase();
    return (
      e.fullName?.toLowerCase().includes(query) ||
      e.username?.toLowerCase().includes(query) ||
      e.email?.toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTechnicians.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTechnicians = filteredTechnicians.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="min-h-screen max-w-full mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-white border border-light-border dark:border-light-border rounded-2xl p-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-light-text dark:text-light-text">Technician Management</h1>
            <p className="text-light-text-secondary dark:text-light-text-secondary">Manage technicians and track attendance</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/technicians/addtechnician")}
          className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-200"
        >
          <UserPlus size={20} /> Add New Technician
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-white border border-light-border dark:border-light-border rounded-2xl p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-light-text-tertiary dark:text-light-text-tertiary" />
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-light-bg dark:bg-light-bg border border-light-border dark:border-light-border rounded-lg text-sm text-light-text dark:text-light-text placeholder:text-light-text-tertiary dark:placeholder:text-light-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-white border border-light-border dark:border-light-border rounded-2xl overflow-hidden shadow-sm">
        <>
          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead className="bg-light-bg dark:bg-light-bg border-b border-light-border dark:border-light-border">
                <tr>
                  {[
                    "Full Name",
                    "Username",
                    "Email",
                    "Contact",
                    "Status",
                    "Today's Attendance",
                    "Mark Attendance",
                    "Actions",
                  ].map((head) => (
                    <th key={head} className="px-6 py-4 text-left text-xs font-semibold text-light-text-secondary dark:text-light-text-secondary uppercase tracking-wider">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-light-border">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500 dark:text-primary-400 mb-2" />
                      <p className="text-light-text-secondary dark:text-light-text-secondary">Loading technicians...</p>
                    </td>
                  </tr>
                ) : paginatedTechnicians.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center text-light-text-tertiary dark:text-light-text-tertiary"
                    >
                      No technicians found
                    </td>
                  </tr>
                ) : (
                  paginatedTechnicians.map((exec) => {
                    // Get today's attendance from backend
                    const todayAttendance = exec.attendance;
                    const isTodayPresent = todayAttendance?.status === 'Present';

                    return (
                      <tr
                        key={exec._id}
                        className="transition-colors duration-200 hover:bg-light-bg/50 dark:hover:bg-light-bg/50"
                      >
                        <td
                          className="px-6 py-4 text-sm font-semibold text-light-text dark:text-light-text cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          onClick={() => handleEdit(exec)}
                        >
                          {exec.fullName}
                        </td>
                        <td className="px-6 py-4 text-sm text-light-text-secondary dark:text-light-text-secondary">{exec.username}</td>
                        <td className="px-6 py-4 text-sm text-light-text-secondary dark:text-light-text-secondary">{exec.email}</td>
                        <td className="px-6 py-4 text-sm text-light-text-secondary dark:text-light-text-secondary">{exec.contactNumber}</td>
                        <td className="px-6 py-4 text-sm">
                          {exec.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                              <CheckCircle size={12} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                              <XCircle size={12} /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            {todayAttendance ? (
                              <>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${todayAttendance.status === 'Present'
                                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
                                  }`}>
                                  {todayAttendance.status === 'Present' ? (
                                    <CheckCircle size={12} />
                                  ) : (
                                    <XCircle size={12} />
                                  )}
                                  {todayAttendance.status}
                                </span>
                                <button
                                  onClick={() => navigate('/attendance/' + exec._id)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                                  title="View Full Record"
                                >
                                  <Calendar size={12} />
                                  Record
                                </button>
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-light-bg dark:bg-light-bg text-light-text-tertiary dark:text-light-text-tertiary border border-light-border dark:border-light-border">
                                <Clock size={12} />
                                Not Marked
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center">
                            {markingAttendanceFor === exec._id ? (
                              <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                            ) : (
                              <Toggle
                                checked={isTodayPresent}
                                onChange={(isPresent) => handleMarkAttendance(exec._id, isPresent)}
                                disabled={markingAttendanceFor !== null}
                                size="md"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(exec._id);
                              }}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                              title="Delete Technician"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500 mb-2" />
                <p className="text-light-text-secondary">Loading technicians...</p>
              </div>
            ) : paginatedTechnicians.length === 0 ? (
              <div className="py-12 text-center text-light-text-tertiary">
                No technicians found
              </div>
            ) : (
              paginatedTechnicians.map((exec) => {
                const todayAttendance = exec.attendance;
                const isTodayPresent = todayAttendance?.status === 'Present';

                return (
                  <div key={exec._id} className="bg-white dark:bg-white border border-light-border dark:border-light-border rounded-xl p-4 shadow-sm relative">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-light-border">
                      <div className="flex-1 cursor-pointer" onClick={() => handleEdit(exec)}>
                        <div className="text-sm font-bold text-light-text mb-1 hover:text-primary-600 transition-colors">
                          {exec.fullName}
                        </div>
                        <div className="text-xs text-light-text-secondary mb-1">
                          @{exec.username}
                        </div>
                        <div className="flex items-center gap-2">
                          {exec.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-600">
                              <CheckCircle size={10} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-600">
                              <XCircle size={10} /> Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(exec._id);
                        }}
                        className="p-1.5 align-top text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-2 mb-4">
                      <div className="text-xs flex items-center gap-2 text-light-text-secondary">
                        <span className="w-4 flex justify-center text-light-text-tertiary">📧</span> {exec.email}
                      </div>
                      <div className="text-xs flex items-center gap-2 text-light-text-secondary">
                        <span className="w-4 flex justify-center text-light-text-tertiary">📞</span> {exec.contactNumber}
                      </div>
                    </div>

                    {/* Attendance Controls */}
                    <div className="bg-light-bg -mx-4 -mb-4 px-4 py-3 rounded-b-xl flex justify-between items-center border-t border-light-border">
                      <div>
                        <div className="text-[10px] text-light-text-secondary mb-1 uppercase font-semibold">Today's Attendance</div>
                        <div className="flex items-center gap-2 mt-1">
                          {todayAttendance ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${todayAttendance.status === 'Present' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                              {todayAttendance.status === 'Present' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                              {todayAttendance.status}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-white border border-light-border text-light-text-tertiary">
                              <Clock size={10} /> Not Marked
                            </span>
                          )}
                          {todayAttendance && (
                            <button
                              onClick={() => navigate('/attendance/' + exec._id)}
                              className="text-[10px] text-primary-600 font-medium underline"
                            >
                              Record
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        {markingAttendanceFor === exec._id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                        ) : (
                          <Toggle
                            checked={isTodayPresent}
                            onChange={(isPresent) => handleMarkAttendance(exec._id, isPresent)}
                            disabled={markingAttendanceFor !== null}
                            size="sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-light-border dark:border-light-border flex items-center justify-between bg-white dark:bg-white">
          <div className="text-sm text-light-text-secondary dark:text-light-text-secondary">
            Showing {filteredTechnicians.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(endIndex, filteredTechnicians.length)} of{" "}
            {filteredTechnicians.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-light-border dark:border-light-border text-light-text dark:text-light-text hover:bg-light-bg dark:hover:bg-light-bg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-light-border dark:border-light-border text-light-text dark:text-light-text hover:bg-light-bg dark:hover:bg-light-bg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm font-medium text-light-text dark:text-light-text">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-light-border dark:border-light-border text-light-text dark:text-light-text hover:bg-light-bg dark:hover:bg-light-bg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-light-border dark:border-light-border text-light-text dark:text-light-text hover:bg-light-bg dark:hover:bg-light-bg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
