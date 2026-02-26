import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-helpers";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
}

export function ImageUpload({ value, onChange, label = "Image", className }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Not authenticated. Please log in again.');
            }

            const response = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || data.message || 'Upload failed');
            }

            onChange(data.url);
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`Failed to upload image: ${error.message}`);
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const clearImage = () => {
        onChange('');
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">
                    {label}
                </label>
            )}

            <div className="border border-white/10 rounded-lg p-4 bg-[hsl(224_71%_4%_/_0.5)]">
                {value ? (
                    <div className="relative group aspect-video w-full max-w-[200px] rounded-md overflow-hidden bg-black/50 border border-white/10">
                        <img
                            src={value}
                            alt="Uploaded preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/10 rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-white/40 hover:text-purple-400"
                    >
                        {uploading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <Upload size={24} />
                        )}
                        <span className="text-sm font-medium">
                            {uploading ? 'Uploading...' : 'Click to upload image'}
                        </span>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* Helper text or manual URL input fallback could go here if needed */}
                {!value && !uploading && (
                    <div className="mt-2 text-xs text-white/30 text-center">
                        Supported formats: JPG, PNG, GIF, WEBP (Max 5MB)
                    </div>
                )}
            </div>
        </div>
    );
}
