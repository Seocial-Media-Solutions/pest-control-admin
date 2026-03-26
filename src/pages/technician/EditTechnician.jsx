import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TechnicianForm from "../../components/TechniciansForm";
import toast from "react-hot-toast";
import { API_URL } from "../../utils";
export default function EditTechnician() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${API_URL}/technicians/${id}`);
      const data = await res.json();
      if (data.success) setInitialData(data.data);
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (data) => {
    const promise = fetch(`${API_URL}/technicians/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(async (res) => {
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Error updating technician");
      return result;
    });

    toast.promise(promise, {
      loading: "Updating technician...",
      success: "Technician updated successfully!",
      error: (err) => err.message,
    });

    try {
      await promise;
      navigate("/technicians");
    } catch { /* Ignore */ }
  };

  if (!initialData) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <TechnicianForm mode="edit" initialData={initialData} onSubmit={handleSubmit} />
    </div>
  );
}
