import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bug, Upload, X } from 'lucide-react';
import { useServices } from '../context/ServiceContext';
import { toast } from 'react-hot-toast';

const AddService = () => {
    const navigate = useNavigate();
    const { createService } = useServices();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        metaImage: '',
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    // update handleSubmit to use context createService
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('metaTitle', formData.metaTitle);
            data.append('metaDescription', formData.metaDescription);
            data.append('metaKeywords', formData.metaKeywords);
            data.append('metaImage', formData.metaImage);

            if (imageFile) {
                data.append('image', imageFile);
            }

            await createService(data);
            // toast is handled in context, but adding navigation here
            navigate('/services');
        } catch (error) {
            // error toast handled in context usually, but catching here just in case specific logic needed
            // Context handles toast.error, but we might want to ensure we don't navigate if error.
            // createService throws on error, so we land here.
            console.error('Error creating service:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/services')}
                    className="p-2 hover:bg-dark-surface rounded-lg transition-colors text-dark-text-secondary"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-dark-text">Add New Service</h1>
                    <p className="text-dark-text-secondary">Create a new pest control service package</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main Info Card */}
                <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-dark-text mb-6 flex items-center gap-2">
                        <Bug className="w-5 h-5 text-primary-500" />
                        Service Details
                    </h2>

                    <div className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Service Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="e.g. General Pest Control"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                                placeholder="Detailed description of the service..."
                                required
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Service Image <span className="text-red-500">*</span>
                            </label>

                            <div className={`
                                relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center
                                ${imagePreview ? 'border-primary-500/50 bg-primary-500/5' : 'border-dark-border hover:border-primary-500/50 hover:bg-dark-bg/50'}
                            `}>
                                {imagePreview ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-48 rounded-lg object-cover shadow-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-3 -right-3 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-primary-500/10 text-primary-400 rounded-full flex items-center justify-center mx-auto">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-dark-text font-medium">Click to upload or drag and drop</p>
                                            <p className="text-sm text-dark-text-tertiary mt-1">SVG, PNG, JPG or WEBP (max. 5MB)</p>
                                        </div>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Card */}
                <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-dark-text mb-6">SEO Configuration</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Meta Title
                            </label>
                            <input
                                type="text"
                                value={formData.metaTitle}
                                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="SEO Title"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Meta Description
                            </label>
                            <textarea
                                value={formData.metaDescription}
                                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                                placeholder="SEO Description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Meta Keywords
                            </label>
                            <input
                                type="text"
                                value={formData.metaKeywords}
                                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="keyword1, keyword2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Meta Image URL
                            </label>
                            <input
                                type="text"
                                value={formData.metaImage}
                                onChange={(e) => setFormData({ ...formData, metaImage: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-dark-text focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/services')}
                        className="px-6 py-3 bg-dark-surface border border-dark-border rounded-xl font-semibold text-dark-text hover:bg-dark-surface-hover transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? 'Creating...' : 'Create Service'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddService;
