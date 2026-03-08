import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: string | number;
        isUp?: boolean;
        label?: string;
    };
    color?: "blue" | "green" | "purple" | "orange";
    delay?: string;
}

export default function StatCard({ label, value, icon: Icon, trend, delay = "0ms" }: StatCardProps) {
    const [displayValue, setDisplayValue] = useState<string | number>(0);
    const [isPulsing, setIsPulsing] = useState(false);

    useEffect(() => {
        const isNumber = value !== '' && (typeof value === 'number' || !isNaN(Number(value)));
        if (!isNumber) {
            setDisplayValue(value);
            return;
        }

        const targetValue = Number(value);
        const startValue = 0;
        const duration = 1500;
        const frameRate = 1000 / 60;
        const totalFrames = Math.round(duration / frameRate);
        let frame = 0;
        let pulseTimeout: ReturnType<typeof setTimeout>;

        const easeOutExpo = (t: number): number => {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        };

        const counter = setInterval(() => {
            frame++;
            const progress = easeOutExpo(frame / totalFrames);
            const current = Math.round(startValue + (targetValue - startValue) * progress);

            setDisplayValue(current);

            if (frame >= totalFrames) {
                clearInterval(counter);
                setDisplayValue(targetValue);
                setIsPulsing(true);
                pulseTimeout = setTimeout(() => setIsPulsing(false), 400);
            }
        }, frameRate);

        return () => {
            clearInterval(counter);
            clearTimeout(pulseTimeout);
        };
    }, [value]);

    return (
        <div
            className="nm-flat stat-card group cursor-default"
            style={{ animationDelay: delay }}
        >
            <div className="flex items-start justify-between">
                <div className="icon-container-inset group-hover:text-indigo-500 group-hover:rotate-6 transition-all duration-500">
                    <Icon size={24} strokeWidth={2.5} className="animate-float-icon" />
                </div>

                {trend && (
                    <div className={cn(
                        "nm-inset px-3 py-1.5 rounded-full flex items-center gap-1.5",
                        trend.isUp ? "text-emerald-500" : "text-rose-500"
                    )}>
                        <span className="text-[10px] font-black tracking-widest uppercase">
                            {trend.isUp === true ? "+" : trend.isUp === false ? "-" : ""}{trend.value}
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-6 space-y-1">
                <h3 className={cn(
                    "text-3xl font-black text-[var(--admin-text-primary)] tracking-tighter tabular-nums transition-all duration-300",
                    isPulsing && "animate-count-pulse text-indigo-500"
                )}>
                    {displayValue}
                </h3>
                <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-[0.2em]">
                        {label}
                    </p>
                    {trend?.label && (
                        <span className="w-1 h-1 rounded-full bg-black/10" />
                    )}
                    {trend?.label && (
                        <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-wider italic">
                            {trend.label}
                        </p>
                    )}
                </div>
            </div>

            {/* Subtle Progress Bar Inset */}
            <div className="mt-5 pt-4 border-t border-black/5">
                <div className="progress-track h-1.5">
                    <div
                        className="progress-fill"
                        style={{ width: '65%', background: trend?.isUp ? undefined : 'linear-gradient(90deg, #f43f5e, #fb7185)' }}
                    />
                </div>
            </div>
        </div>
    );
}
