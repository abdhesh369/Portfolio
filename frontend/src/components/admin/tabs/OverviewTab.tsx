import React, { useState, useEffect } from "react";
import { useProjects, useSkills, useExperiences } from "@/hooks/use-portfolio";
import { apiFetch } from "@/lib/api-helpers";
import type { Message } from "@shared/schema";

export function OverviewTab({ token }: { token: string | null }) {
    const { data: projects } = useProjects();
    const { data: skills } = useSkills();
    const { data: experiences } = useExperiences();
    const [msgCount, setMsgCount] = useState<number | null>(null);

    useEffect(() => {
        apiFetch("/api/messages", token)
            .then((d: Message[]) => setMsgCount(d?.length ?? 0))
            .catch(() => setMsgCount(0));
    }, [token]);

    const stats = [
        { label: "Projects", value: projects?.length ?? "—", icon: "🚀", color: "from-purple-500 to-indigo-600" },
        { label: "Messages", value: msgCount ?? "—", icon: "✉️", color: "from-emerald-500 to-teal-600" },
        { label: "Skills", value: skills?.length ?? "—", icon: "⚡", color: "from-amber-500 to-orange-600" },
        { label: "Experiences", value: experiences?.length ?? "—", icon: "💼", color: "from-rose-500 to-pink-600" },
    ];

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-display)" }}>
                Dashboard Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/10 p-5 relative overflow-hidden"
                        style={{ background: "hsl(222 47% 11% / 0.6)" }}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl bg-gradient-to-br ${s.color}`} />
                        <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
                        <p className="text-sm text-white/50 flex items-center gap-1.5">
                            <span>{s.icon}</span> {s.label}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-8 rounded-xl border border-white/10 p-6" style={{ background: "hsl(222 47% 11% / 0.4)" }}>
                <h3 className="text-lg font-semibold text-white mb-3">Quick Tips</h3>
                <ul className="space-y-2 text-sm text-white/60">
                    <li>💡 Use the <strong className="text-white/80">Messages</strong> tab to view and manage visitor inquiries.</li>
                    <li>📝 Add new projects, skills, and experiences directly from their tabs.</li>
                    <li>🔒 Your session expires after 24 hours — just log in again.</li>
                    <li>🔗 No public link points to <code className="text-purple-400">/admin</code> — it's hidden by design.</li>
                </ul>
            </div>
        </div>
    );
}
