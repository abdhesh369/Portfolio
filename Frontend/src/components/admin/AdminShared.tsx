

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function FormField({ label, name, defaultValue, value, onChange, placeholder, required, type = "text", min, max, className }: {
    label: string; name?: string; defaultValue?: string; value?: string; onChange?: (v: string) => void; placeholder?: string; required?: boolean; type?: string; min?: string | number; max?: string | number; className?: string;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black text-admin-text-secondary uppercase tracking-[0.2em] ml-1">{label}</label>
            <input
                type={type}
                name={name}
                defaultValue={defaultValue}
                value={value}
                onChange={onChange ? (e) => onChange(e.target.value) : undefined}
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

export function FormTextarea({ label, name, defaultValue, value, onChange, placeholder, required, className }: {
    label: string; name?: string; defaultValue?: string; value?: string; onChange?: (v: string) => void; placeholder?: string; required?: boolean; className?: string;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black text-admin-text-secondary uppercase tracking-[0.2em] ml-1">{label}</label>
            <textarea
                name={name}
                defaultValue={defaultValue}
                value={value}
                onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                placeholder={placeholder}
                required={required}
                rows={4}
                aria-label={label}
                className={cn("nm-inset w-full px-5 py-3 rounded-xl text-admin-text-primary text-sm shadow-inner transition-all outline-none focus:ring-2 focus:ring-nm-accent/20 resize-y placeholder:text-admin-text-muted", className)}
            />
        </div>
    );
}

export function FormSelect({ label, name, defaultValue, value, onChange, options, icon, className }: {
    label: string; name?: string; defaultValue?: string; value?: string; onChange?: (v: string) => void; options: { label: string, value: string }[], icon?: React.ReactNode, className?: string;
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black text-admin-text-secondary uppercase tracking-[0.2em] ml-1">{label}</label>
            <div className="relative">
                <select
                    name={name}
                    defaultValue={defaultValue}
                    value={value}
                    onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                    aria-label={label}
                    className={cn("nm-inset w-full px-5 py-3 rounded-xl text-admin-text-primary text-sm shadow-inner transition-all outline-none focus:ring-2 focus:ring-nm-accent/20 bg-transparent appearance-none", className)}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                {icon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-admin-text-muted">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

export function FormCheckbox({ label, name, defaultChecked, checked, onChange, activeColor, className }: {
    label: string; name?: string; defaultChecked?: boolean; checked?: boolean; onChange?: (v: boolean) => void; activeColor?: string, className?: string;
}) {
    return (
        <label className={cn("flex items-center gap-4 cursor-pointer group select-none py-1", className)}>
            <div className={cn(
                "w-5 h-5 rounded-lg nm-inset flex items-center justify-center transition-all duration-300",
                checked ? (activeColor || "bg-nm-accent text-white") : "group-hover:nm-flat"
            )}>
                {checked && <Check size={12} strokeWidth={4} color="white" />}
            </div>
            <input
                type="checkbox"
                className="hidden"
                name={name}
                defaultChecked={defaultChecked}
                checked={checked}
                onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
            />
            <span className="text-[11px] font-black uppercase tracking-widest text-admin-text-secondary group-hover:text-admin-text-primary">
                {label}
            </span>
        </label>
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

