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
                const res = await fetch(
                  `http://localhost:3000/api/technicians/${id}`,
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
    <div className="min-h-screen max-w-full mx-auto">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-lg p-6 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-black">
            <Users className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Technician & Attendance Management</h1>
            <p className="text-gray-500">Manage technicians and mark attendance</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/technicians/addtechnician")}
          className="flex items-center gap-2 px-6 py-3 rounded-lg shadow-md bg-black text-white hover:bg-gray-800 transition"
        >
          <UserPlus size={20} /> Add New Technician
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, username, or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      {/* Table */}
      <div className=" rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr className="border-b-2 border-gray-200">
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
                  <th key={head} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-2">Loading technicians...</p>
                  </td>
                </tr>
              ) : paginatedTechnicians.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-8 text-center text-gray-500"
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
                      className="transition-all duration-200 border-b border-gray-100  hover:bg-gray-50 hover:shadow-sm"
                    >
                      <td
                        className="px-6 py-4 text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleEdit(exec)}
                      >
                        {exec.fullName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{exec.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{exec.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{exec.contactNumber}</td>
                      <td className="px-6 py-4 text-sm">
                        {exec.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle size={14} className="text-green-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            <XCircle size={14} className="text-red-600" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center gap-2">
                          {todayAttendance ? (
                            <>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${todayAttendance.status === 'Present'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                {todayAttendance.status === 'Present' ? (
                                  <CheckCircle size={14} className="text-green-600" />
                                ) : (
                                  <XCircle size={14} className="text-red-600" />
                                )}
                                {todayAttendance.status}
                              </span>
                              <button
                                onClick={() => navigate('/attendance/' + exec._id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                                title="View Full Record"
                              >
                                <Calendar size={14} />
                                Record
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                              <Clock size={14} className="text-gray-500" />
                              Not Marked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center">
                          {markingAttendanceFor === exec._id ? (
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
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
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(exec._id);
                            }}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:shadow-sm border border-transparent hover:border-red-200"
                            title="Delete Technician"
                          >
                            <Trash2 size={18} />
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

        {/* Pagination */}
        <div className="px-2 sm:px-6 py-2 flex items-center justify-between border-t ">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredTechnicians.length)} of{" "}
            {filteredTechnicians.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border transition-all disabled:opacity-30 hover:bg-gray-100"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border transition-all disabled:opacity-30 hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm font-medium">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border transition-all disabled:opacity-30 hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border transition-all disabled:opacity-30 hover:bg-gray-100"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
