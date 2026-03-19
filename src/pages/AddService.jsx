import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bug, Upload, X } from 'lucide-react';
import { useServices } from '../context/ServiceContext';
import { toast } from 'react-hot-toast';

const AddService = () => {
    const navigate = useNavigate();
    const { createService } = useServices();
    const [loading, setLoading]         = useState(false);
    const [imageFile, setImageFile]     = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '' });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
    };

    const removeImage = () => { setImageFile(null); setImagePreview(null); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            if (imageFile) data.append('image', imageFile);
            await createService(data);
            navigate('/services');
        } catch (error) {
            console.error('Error creating service:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <style>{`
                .sg-card { background:#fff; border:1px solid #d4edbe; border-radius:1rem; }
                .sg-input { width:100%; padding:.75rem 1rem; background:#f6faf1; border:1px solid #d4edbe; border-radius:.75rem; color:#1a2e0e; transition:border-color .2s,box-shadow .2s; }
                .sg-input:focus { outline:none; border-color:#79bd4b; box-shadow:0 0 0 3px rgba(121,189,75,.15); }
                .sg-btn-primary { background:linear-gradient(135deg,#79bd4b,#4e8230); color:#fff; border-radius:.75rem; font-weight:600; padding:.75rem 2rem; transition:all .2s; }
                .sg-btn-primary:hover:not(:disabled) { box-shadow:0 6px 20px rgba(121,189,75,.35); transform:translateY(-1px); }
                .sg-btn-primary:disabled { opacity:.5; cursor:not-allowed; }
            `}</style>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/services')}
                    className="p-2 hover:bg-[#f6faf1] border border-transparent hover:border-[#d4edbe] rounded-lg transition-colors text-[#4e8230]">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2e4d1b]">Add New Service</h1>
                    <p className="text-sm text-[#4e8230] mt-1">Create a new pest control service package</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main Info */}
                <div className="sg-card p-6">
                    <h2 className="text-xl font-bold text-[#2e4d1b] mb-6 flex items-center gap-2">
                        <Bug className="w-5 h-5 text-[#79bd4b]" />
                        Service Details
                    </h2>

                    <div className="space-y-5">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-[#2e4d1b] mb-2">
                                Service Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="sg-input"
                                placeholder="e.g. General Pest Control"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-[#2e4d1b] mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="sg-input resize-none"
                                placeholder="Detailed description of the service…"
                                required
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-[#2e4d1b] mb-2">
                                Service Image <span className="text-red-500">*</span>
                            </label>
                            <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                                ${imagePreview ? 'border-[#79bd4b] bg-[#f6faf1]' : 'border-[#d4edbe] hover:border-[#79bd4b] hover:bg-[#f6faf1]'}`}>
                                {imagePreview ? (
                                    <div className="relative inline-block">
                                        <img src={imagePreview} alt="Preview" className="h-48 rounded-lg object-cover shadow-lg" />
                                        <button type="button" onClick={removeImage}
                                            className="absolute -top-3 -right-3 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-[#d4edbe] rounded-full flex items-center justify-center mx-auto">
                                            <Upload className="w-8 h-8 text-[#79bd4b]" />
                                        </div>
                                        <div>
                                            <p className="text-[#2e4d1b] font-medium">Click to upload or drag and drop</p>
                                            <p className="text-sm text-[#7aac52] mt-1">SVG, PNG, JPG or WEBP (max. 5MB)</p>
                                        </div>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/services')}
                        className="px-6 py-3 bg-white border border-[#d4edbe] hover:border-[#79bd4b] rounded-xl font-semibold text-[#2e4d1b] transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="sg-btn-primary flex items-center gap-2">
                        {loading ? (
                            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating…</>
                        ) : 'Create Service'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddService;