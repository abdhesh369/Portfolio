

import { cn } from "@/lib/utils";

export function FormField({ label, value, onChange, placeholder, required, type = "text", min, max, className }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string; min?: string | number; max?: string | number; className?: string;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black text-admin-text-secondary uppercase tracking-[0.2em] ml-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                min={min}
                max={max}
                aria-label={label}
                className={cn("nm-inset w-full px-5 py-3 rounded-xl text-admin-text-primary text-sm shadow-inner transition-all outline-none focus:ring-2 focus:ring-nm-accent/20 placeholder:text-admin-text-muted", className)}
            />
        </div>
    );
}

export function FormTextarea({ label, value, onChange, placeholder, required }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black text-admin-text-secondary uppercase tracking-[0.2em] ml-1">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                rows={4}
                aria-label={label}
                className="nm-inset w-full px-5 py-3 rounded-xl text-admin-text-primary text-sm shadow-inner transition-all outline-none focus:ring-2 focus:ring-nm-accent/20 resize-y placeholder:text-admin-text-muted"
            />
        </div>
    );
}

export function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="text-center py-20 nm-flat border-none mx-auto max-w-lg animate-in fade-in zoom-in duration-500 rounded-[2rem]">
            <div className="nm-inset w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-nm-accent/40">
                {icon}
            </div>
            <p className="text-sm font-medium text-admin-text-secondary tracking-tight px-10 leading-relaxed">{text}</p>
        </div>
    );
}

export function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="nm-flat rounded-2xl p-6 h-28 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>
            ))}
        </div>
    );
}

