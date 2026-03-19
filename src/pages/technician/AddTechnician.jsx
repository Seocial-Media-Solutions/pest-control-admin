import React from "react";
import { useNavigate } from "react-router-dom";
import TechnicianForm from "../../components/TechniciansForm";
import toast from "react-hot-toast";
import { API_URL } from "../../utils";
export default function AddTechnician() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    const promise = fetch(`${API_URL}/technicians`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(async (res) => {
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Error creating technician");
      return result;
    });

    toast.promise(promise, {
      loading: "Creating technician...",
      success: "Technician created successfully!",
      error: (err) => err.message,
    });

    try {
      await promise;
      navigate("/");
    } catch (err) { }
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <TechnicianForm mode="add" onSubmit={handleSubmit} />
    </div>
  );
}
