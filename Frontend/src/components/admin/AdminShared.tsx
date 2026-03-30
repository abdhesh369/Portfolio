import React, { forwardRef } from "react";
import { cn } from "#src/lib/utils";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* --- Premium Technical Components --- */

export function AdminButton({
    children,
    onClick,
    variant = "secondary",
    size = "md",
    isLoading,
    isSuccess,
    disabled,
    icon: Icon,
    iconClassName,
    loadingText = "SYNCING...",
    className,
    title,
    type = "button"
}: {
    children?: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    isSuccess?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    iconClassName?: string;
    loadingText?: string;
    className?: string;
    title?: string;
}) {
    const variants = {
        primary: "nm-button-primary",
        secondary: "nm-button text-[var(--admin-text-primary)]",
        danger: "nm-button text-pink-500 hover:text-pink-400",
        ghost: "bg-transparent text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
    };

    const sizes = {
        sm: "px-4 py-2 text-[9px]",
        md: "px-6 py-3 text-[11px]",
        lg: "px-8 py-4 text-[12px]"
    };

    return (
        <motion.button
            whileHover={!disabled && !isLoading ? { scale: 1.02, translateY: -2 } : {}}
            whileTap={!disabled && !isLoading ? { scale: 0.98, translateY: 0 } : {}}
            onClick={onClick}
            type={type}
            title={title}
            disabled={disabled || isLoading}
            className={cn(
                "relative overflow-hidden flex items-center justify-center gap-3 transition-all",
                variants[variant],
                sizes[size],
                (disabled || isLoading) && "opacity-50 cursor-not-allowed grayscale",
                className
            )}
        >
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2"
                    >
                        <Loader2 size={16} className="animate-spin text-purple-400" />
                        <span className="tracking-[0.2em]">{loadingText.toUpperCase()}</span>
                    </motion.div>
                ) : isSuccess ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center gap-2 text-emerald-400 font-black"
                    >
                        <Check size={16} strokeWidth={3} />
                        <span className="tracking-[0.2em]">EXECUTED</span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3"
                    >
                        {Icon && <Icon size={size === 'sm' ? 14 : 18} className={iconClassName} />}
                        <span className="tracking-[0.15em] font-black uppercase">{children}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

export function SpringToggle({
    label,
    checked,
    onChange,
    description,
    className
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    description?: string;
    className?: string;
}) {
    return (
        <div className={cn("flex items-center justify-between p-6 nm-flat border-[var(--nm-light)]", className)}>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-[var(--admin-text-primary)] tracking-[0.2em] uppercase block">{label}</label>
                {description && <p className="text-[9px] text-admin-text-muted tracking-wide font-medium">{description}</p>}
            </div>
            <motion.button
                onClick={() => onChange(!checked)}
                className={cn(
                    "w-16 h-8 rounded-full p-1.5 transition-colors relative",
                    checked ? "bg-purple-600/20" : "bg-black/40 nm-inset"
                )}
            >
                <motion.div
                    animate={{ x: checked ? 32 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={cn(
                        "w-5 h-5 rounded-full shadow-lg flex items-center justify-center",
                        checked ? "bg-gradient-to-br from-purple-400 to-purple-600" : "bg-slate-700"
                    )}
                >
                    {checked && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </motion.div>
            </motion.button>
        </div>
    );
}

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(({
    label,
    error,
    className,
    placeholder,
    ...props
}, ref) => {
    return (
        <div className={cn("relative group w-full mt-2 md:mt-0", className)}>
            <input
                {...props}
                ref={ref}
                placeholder={placeholder || " "}
                className={cn(
                    "admin-input pt-6 peer placeholder-transparent focus:placeholder-[var(--admin-text-muted)] transition-all text-[var(--admin-text-primary)]",
                    error && "border-pink-500/50 focus:ring-pink-500/20"
                )}
            />
            <label className="absolute left-[24px] top-[16px] z-10 pointer-events-none text-[10px] font-black tracking-[0.2em] uppercase text-[var(--admin-text-muted)] origin-left transition-all duration-300 peer-focus:-translate-y-[28px] peer-focus:scale-[0.85] peer-focus:text-purple-500 peer-[:not(:placeholder-shown)]:-translate-y-[28px] peer-[:not(:placeholder-shown)]:scale-[0.85]">
                {label}
            </label>
            {error && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-pink-500">
                    <AlertCircle size={14} />
                    <span className="text-[8px] font-black tracking-widest">{error.toUpperCase()}</span>
                </div>
            )}
        </div>
    );
});

interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label: string;
    onChange?: (value: string) => void;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export function FormField({ label, icon: Icon, onChange, ...props }: FormFieldProps) {
    return (
        <div className="space-y-4">
            <label className="label-technical ml-1">{label}</label>
            <div className="relative group">
                <input
                    {...props}
                    onChange={(e) => onChange?.(e.target.value)}
                    className={cn(
                        "admin-input",
                        Icon && "pl-12",
                        props.className
                    )}
                />
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500/40 pointer-events-none group-focus-within:text-purple-500 transition-colors">
                        <Icon size={18} />
                    </div>
                )}            </div>
        </div>
    );
}

interface FormTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    label: string;
    onChange?: (value: string) => void;
}

export function FormTextarea({ label, onChange, ...props }: FormTextareaProps) {
    return (
        <div className="space-y-4">
            <label className="label-technical ml-1">{label}</label>
            <textarea
                {...props}
                rows={props.rows || 4}
                onChange={(e) => onChange?.(e.target.value)}
                className={cn("admin-input resize-none", props.className)}
            />
        </div>
    );
}

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label: string;
    options: { label: string; value: string }[];
    icon?: React.ReactNode;
    onChange?: (value: string) => void;
}

export function FormSelect({ label, options, icon: Icon, onChange, ...props }: FormSelectProps) {
    return (
        <div className="space-y-4">
            <label className="label-technical ml-1">{label}</label>
            <div className="relative">
                <select
                    {...props}
                    onChange={(e) => onChange?.(e.target.value)}
                    className={cn("admin-input appearance-none cursor-pointer text-[var(--admin-text-primary)]", props.className)}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[var(--nm-card)] text-[var(--admin-text-primary)]">
                            {opt.label.toUpperCase()}
                        </option>
                    ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    {Icon ? Icon : <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                </div>
            </div>
        </div>
    );
}

export function EmptyState({ icon: Icon, text, className }: { icon: React.ComponentType<{ size?: number; className?: string }>; text: string; className?: string }) {
    return (
        <div className={cn("text-center py-24 nm-flat border-[var(--nm-light)] relative overflow-hidden", className)}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-purple-600/30 to-transparent" />
            <div className="nm-inset w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-purple-500/20 group hover:text-purple-500/40 transition-colors">
                {Icon ? <Icon size={32} /> : <div className="w-4 h-4 bg-current rounded-sm rotate-45" />}
            </div>
            <p className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase max-w-xs mx-auto leading-relaxed">{text}</p>
        </div>
    );
}

interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label: string;
    onChange?: (checked: boolean) => void;
    activeColor?: string;
}

export function FormCheckbox({ label, onChange, checked, activeColor }: FormCheckboxProps) {
    return (
        <div
            className="flex items-center gap-3 py-2 cursor-pointer group"
            onClick={() => onChange?.(!checked)}
        >
            <div className={cn(
                "w-6 h-6 rounded-lg nm-inset flex items-center justify-center transition-all duration-300",
                checked && (activeColor || "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]")
            )}>
                {checked && <Check size={14} strokeWidth={4} className="text-white dark:text-[var(--admin-text-primary)]" />}
            </div>
            <span className="text-[10px] font-black text-admin-text-secondary uppercase tracking-[0.2em] group-hover:text-[var(--admin-text-primary)] transition-colors">
                {label}
            </span>
        </div>
    );
}

export function LoadingSkeleton({ className }: { className?: string } = {}) {
    return (
        <div className={cn("space-y-8 animate-pulse p-2", className)}>
            {[1, 2, 3].map((i) => (
                <div key={i} className="nm-flat rounded-[2rem] p-10 h-40 relative overflow-hidden bg-[var(--nm-light)]">
                    <div className="flex gap-6 items-center">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--nm-shadow)]" />
                        <div className="space-y-3 flex-1">
                            <div className="h-4 w-1/3 bg-[var(--nm-shadow)] rounded" />
                            <div className="h-3 w-1/2 bg-[var(--nm-shadow)] rounded opacity-50" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
