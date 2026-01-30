import React from "react";
import { useNavigate } from "react-router-dom";
import TechnicianForm from "../../components/TechniciansForm"  ;
import toast from "react-hot-toast";

export default function AddTechnician() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    const res = await fetch("http://localhost:3000/api/technicians", {
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
