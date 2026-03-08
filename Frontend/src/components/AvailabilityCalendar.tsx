import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { format, parseISO, isPast } from "date-fns";

export function AvailabilityCalendar() {
    const { data: settings } = useSiteSettings();
    const slots = settings?.availabilitySlots || [];

    // Filter out past slots and sort by date
    const upcomingSlots = slots
        .filter((slot) => !isPast(parseISO(slot.endDate)))
        .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());

    // Group slots by day
    const groupedSlots = upcomingSlots.reduce((acc, slot) => {
        const date = format(parseISO(slot.startDate), "yyyy-MM-dd");
        if (!acc[date]) acc[date] = [];
        acc[date].push(slot);
        return acc;
    }, {} as Record<string, typeof upcomingSlots>);

    const days = Object.keys(groupedSlots).sort();

    if (upcomingSlots.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <Calendar size={48} className="mx-auto mb-4 text-white/20" />
                <h3 className="text-xl font-semibold text-white mb-2">No Specific Availability</h3>
                <p className="text-white/60 max-w-xs mx-auto">
                    I'm currently flexible! Feel free to reach out anytime via the contact form.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/20">
                    <Calendar className="text-purple-400" size={24} aria-hidden="true" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">Availability Calendar</h3>
                    <p className="text-xs text-white/40 font-medium tracking-widest">MY CURRENT WORKING WINDOWS</p>
                </div>
            </div>

            <div className="grid gap-8" role="list" aria-label="Available time slots by day">
                {days.map((day, dayIdx) => (
                    <motion.div
                        key={day}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: dayIdx * 0.1 }}
                        className="space-y-4"
                        role="listitem"
                    >
                        <div className="flex items-center gap-4">
                            <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/10">
                                {format(parseISO(day), "EEEE, MMM do")}
                            </h4>
                            <div className="h-px flex-1 bg-white/5" aria-hidden="true" />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {groupedSlots[day].map((slot) => (
                                <div
                                    key={slot.id}
                                    className="group relative flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-default"
                                    aria-label={`Time slot: ${format(parseISO(slot.startDate), "p")} to ${format(parseISO(slot.endDate), "p")}, Status: ${slot.status}${slot.label ? `, Label: ${slot.label}` : ''}`}
                                >
                                    <div className="bg-white/5 p-2.5 rounded-lg text-white/40 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                                        <Clock size={16} aria-hidden="true" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-semibold text-white/90">
                                                {format(parseISO(slot.startDate), "p")} – {format(parseISO(slot.endDate), "p")}
                                            </span>
                                            {slot.status === 'booked' ? (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-md uppercase tracking-tighter">
                                                    Booked
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-md uppercase tracking-tighter">
                                                    Free
                                                </span>
                                            )}
                                        </div>
                                        {slot.label && (
                                            <p className="text-xs text-white/40 truncate mt-0.5">{slot.label}</p>
                                        )}
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                                        <ArrowRight size={14} className="text-white/20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] text-center text-white/30 uppercase tracking-[0.2em] font-bold">
                    All times are shown in your local timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </p>
            </div>
        </div>
    );
}
