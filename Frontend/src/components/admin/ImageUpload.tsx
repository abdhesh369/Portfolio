import { useState, useRef } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { apiFetch } from "@/lib/api-helpers";
import { useToast } from "@/hooks/use-toast";
import { OptimizedImage } from "@/components/OptimizedImage";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
}

export function ImageUpload({ value, onChange, label = "Image", className }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({ title: "Invalid file type", description: "Please upload an image file.", variant: "destructive" });
            return;
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File too large", description: "File size should be less than 5MB.", variant: "destructive" });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const data = await apiFetch("/api/v1/upload", {
                method: 'POST',
                body: formData
            });

            onChange(data.url);
        } catch (error: unknown) {
            console.error('Upload error:', error);
            const message = error instanceof Error ? error.message : "Failed to upload image.";
            toast({ title: "Upload failed", description: message, variant: "destructive" });
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
                        <OptimizedImage
                            src={value}
                            alt="Uploaded preview"
                            width={400}
                            height={300}
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
