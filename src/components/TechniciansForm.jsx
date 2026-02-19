import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Eye, EyeOff, User, Mail, Phone, CreditCard, FileText,
  MapPin, Shield, CheckCircle, AlertCircle, Briefcase, Lock
} from "lucide-react";

export default function TechnicianForm({ initialData, onSubmit, mode }) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
      email: "",
      contactNumber: "",
      aadharNumber: "",
      drivingLicenseNumber: "",
      fullName: "",
      address: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      const { password, ...rest } = initialData;
      reset(rest);
    }
  }, [initialData, reset]);

  const onFormSubmit = (data) => {
    if (mode === 'edit' && !data.password) {
      delete data.password;
    }
    onSubmit(data);
  };

  const validationRules = {
    fullName: { required: "Full Name is required" },
    username: {
      required: "Username is required",
      minLength: { value: 3, message: "Min 3 chars required" }
    },
    password: {
      required: mode === 'add' ? "Password is required" : false,
      minLength: { value: 8, message: "Min 8 chars required" },
      pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
        message: "Weak password"
      }
    },
    email: {
      required: "Email is required",
      pattern: {
        value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        message: "Invalid email"
      }
    },
    contactNumber: {
      required: "Contact Number is required",
      pattern: {
        value: /^\d{10}$/,
        message: "Must be 10 digits"
      }
    },
    aadharNumber: {
      required: "Aadhar Number is required",
      pattern: {
        value: /^\d{12}$/,
        message: "Must be 12 digits"
      }
    },
    drivingLicenseNumber: { required: "Driving License is required" },
    address: { required: false },
  };

  // Helper component for input fields
  const InputField = ({ label, name, type = "text", icon: Icon, placeholder, registerProps, error }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-light-text dark:text-dark-text flex items-center gap-2">
        {label}
        {error && <span className="text-red-500 dark:text-red-400 text-xs font-normal ml-auto flex items-center gap-1"><AlertCircle size={12} /> {error.message}</span>}
      </label>
      <div className="relative group">
        <div className="absolute left-3 top-2.5 text-light-text-tertiary dark:text-dark-text-tertiary group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors">
          <Icon size={18} />
        </div>
        <input
          type={type}
          {...registerProps}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2.5 bg-light-bg dark:bg-dark-bg border ${error ? 'border-red-300 dark:border-red-500/50 ring-2 ring-red-50 dark:ring-red-500/10' : 'border-light-border dark:border-dark-border'} rounded-xl focus:bg-white dark:focus:bg-dark-surface focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:border-primary-500 outline-none transition-all duration-200 placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary text-light-text dark:text-dark-text`}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text tracking-tight">
          {mode === "edit" ? "Update Technician Profile" : "Onboard New Technician"}
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Manage technician access and personal details.</p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">

        {/* Section 1: Personal Information */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-light-border dark:border-dark-border overflow-hidden">
          <div className="border-b border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
              <User size={20} className="text-primary-600 dark:text-primary-400" />
              Personal Information
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Full Name"
              name="fullName"
              icon={User}
              placeholder="e.g. John Doe"
              registerProps={register("fullName", validationRules.fullName)}
              error={errors.fullName}
            />
            <InputField
              label="Contact Number"
              name="contactNumber"
              icon={Phone}
              placeholder="e.g. 9876543210"
              registerProps={register("contactNumber", validationRules.contactNumber)}
              error={errors.contactNumber}
            />
            <InputField
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              placeholder="john@insurance.com"
              registerProps={register("email", validationRules.email)}
              error={errors.email}
            />
            <InputField
              label="Current Address"
              name="address"
              icon={MapPin}
              placeholder="Full residential address"
              registerProps={register("address", validationRules.address)}
              error={errors.address}
            />
          </div>
        </div>

        {/* Section 3: Professional Documents */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-light-border dark:border-dark-border overflow-hidden">
          <div className="border-b border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
              <FileText size={20} className="text-orange-600 dark:text-orange-400" />
              Professional Documents
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Aadhar Number"
              name="aadharNumber"
              icon={CreditCard}
              placeholder="12-digit UIDAI number"
              registerProps={register("aadharNumber", validationRules.aadharNumber)}
              error={errors.aadharNumber}
            />
            <InputField
              label="Driving License Number"
              name="drivingLicenseNumber"
              icon={CreditCard}
              placeholder="Valid driving license number"
              registerProps={register("drivingLicenseNumber", validationRules.drivingLicenseNumber)}
              error={errors.drivingLicenseNumber}
            />
          </div>
        </div>
        {/* Section 2: Account Security */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-light-border dark:border-dark-border overflow-hidden">
          <div className="border-b border-light-border dark:border-dark-border bg-light-bg/50 dark:bg-dark-bg/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
              <Shield size={20} className="text-purple-600 dark:text-purple-400" />
              Account Security
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Username"
              name="username"
              icon={Briefcase}
              placeholder="Create a unique username"
              registerProps={register("username", validationRules.username)}
              error={errors.username}
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-light-text dark:text-dark-text flex items-center gap-2">
                Password {mode === 'edit' && <span className="text-light-text-tertiary dark:text-dark-text-tertiary font-normal text-xs">(Optional)</span>}
                {errors.password && <span className="text-red-500 dark:text-red-400 text-xs font-normal ml-auto flex items-center gap-1"><AlertCircle size={12} /> {errors.password.message}</span>}
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-2.5 text-light-text-tertiary dark:text-dark-text-tertiary group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", validationRules.password)}
                  placeholder={mode === 'edit' ? "Leave blank to keep current" : "Create a strong password"}
                  className={`w-full pl-10 pr-10 py-2.5 bg-light-bg dark:bg-dark-bg border ${errors.password ? 'border-red-300 dark:border-red-500/50 ring-2 ring-red-50 dark:ring-red-500/10' : 'border-light-border dark:border-dark-border'} rounded-xl focus:bg-white dark:focus:bg-dark-surface focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 focus:border-purple-500 outline-none transition-all duration-200 text-light-text dark:text-dark-text`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-light-text dark:hover:text-dark-text transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength/Requirement Tracker */}
              {(mode === 'add' || watch('password')?.length > 0) && (
                <div className="mt-3 p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg">
                  <p className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-2 uppercase tracking-wide">Security Requirements</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { check: watch('password')?.length >= 8, label: "8+ Characters" },
                      { check: /[A-Z]/.test(watch('password') || ""), label: "UpperCase (A-Z)" },
                      { check: /[a-z]/.test(watch('password') || ""), label: "LowerCase (a-z)" },
                      { check: /\d/.test(watch('password') || ""), label: "Number (0-9)" },
                      { check: /[\W_]/.test(watch('password') || ""), label: "Special Char (!@#)" },
                    ].map((req, idx) => (
                      <div key={idx} className={`flex items-center gap-2 text-xs transition-colors duration-300 ${req.check ? "text-green-700 dark:text-green-400 font-medium" : "text-light-text-tertiary dark:text-dark-text-tertiary"}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${req.check ? "bg-green-500 border-green-500 text-white" : "border-light-border dark:border-dark-border"}`}>
                          <CheckCircle size={10} className={req.check ? "opacity-100" : "opacity-0"} />
                        </div>
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center pt-8">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-light-border dark:bg-dark-border rounded-full peer peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-green-300 transition-all after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-light-border dark:after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </div>
                <span className="text-sm font-medium text-light-text dark:text-dark-text group-hover:text-primary-600 dark:group-hover:text-primary-400">Account Active</span>
              </label>
            </div>

          </div>
        </div>


        <div className="flex justify-end pt-4 pb-12">
          <button
            type="submit"
            className="px-8 py-3 bg-gray-900 hover:bg-black dark:bg-primary-600 dark:hover:bg-primary-500 text-white rounded-xl font-semibold shadow-lg shadow-gray-200 dark:shadow-primary-900/20 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
          >
            <CheckCircle size={20} />
            {mode === "edit" ? "Save Changes" : "Create Technician Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
