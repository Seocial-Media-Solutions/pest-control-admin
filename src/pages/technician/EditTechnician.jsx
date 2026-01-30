import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TechnicianForm from "../../components/TechniciansForm";
import toast from "react-hot-toast";

export default function EditTechnician() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:3000/api/technicians/${id}`);
      const data = await res.json();
      if (data.success) setInitialData(data.data);
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (data) => {
    const res = await fetch(`http://localhost:3000/api/technicians/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      toast.success("Technician updated successfully!");
      navigate("/technicians");
    } else {
      toast.error(result.message || "Error updating technician");
    }
  };

  if (!initialData) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <TechnicianForm mode="edit" initialData={initialData} onSubmit={handleSubmit} />
    </div>
  );
}
