import React from "react";

export function FormField({ label, value, onChange, placeholder, required }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-white/25
          border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20
          transition-all outline-none"
                style={{ background: "hsl(224 71% 4% / 0.5)" }}
            />
        </div>
    );
}

export function FormTextarea({ label, value, onChange, required }: {
    label: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-1.5">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-white text-sm placeholder-white/25
          border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20
          transition-all outline-none resize-y"
                style={{ background: "hsl(224 71% 4% / 0.5)" }}
            />
        </div>
    );
}

export function EmptyState({ icon, text }: { icon: string; text: string }) {
    return (
        <div className="text-center py-16">
            <p className="text-4xl mb-3">{icon}</p>
            <p className="text-sm text-white/40">{text}</p>
        </div>
    );
}

export function LoadingSkeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-white/5 p-5 h-24" style={{ background: "hsl(222 47% 11% / 0.3)" }} />
            ))}
        </div>
    );
}
