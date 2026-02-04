import React from "react";
import { useNavigate } from "react-router-dom";
import TechnicianForm from "../../components/TechniciansForm";
import toast from "react-hot-toast";
import { API_URL } from "../../utils";
export default function AddTechnician() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    const res = await fetch(`${API_URL}/technicians`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      toast.success("Technician created successfully!");
      navigate("/");
    } else {
      toast.error(result.message || "Error creating technician");
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <TechnicianForm mode="add" onSubmit={handleSubmit} />
    </div>
  );
}
