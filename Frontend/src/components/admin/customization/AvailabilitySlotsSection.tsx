import React, { useState } from "react";
import { Plus, Trash2, Calendar, Clock, AlertCircle } from "lucide-react";
import { CollapsibleSection } from "./SectionsCommon";
import { format, isAfter, parseISO } from "date-fns";
import { FloatingLabelInput, AdminButton } from "../AdminShared";

interface AvailabilitySlot {
    id: string;
    startDate: string;
    endDate: string;
    status: 'available' | 'booked' | 'unavailable';
    label?: string;
}

interface AvailabilitySlotsSectionProps {
    isOpen: boolean;
    onToggle: () => void;
    slots: AvailabilitySlot[];
    onChange: (slots: AvailabilitySlot[]) => void;
}

export function AvailabilitySlotsSection({
    isOpen,
    onToggle,
    slots = [],
    onChange,
}: AvailabilitySlotsSectionProps) {
    const [newSlot, setNewSlot] = useState({
        startDate: "",
        startTime: "09:00",
        endDate: "",
        endTime: "10:00",
        label: "",
    });

    const handleAddSlot = () => {
        if (!newSlot.startDate || !newSlot.endDate) return;

        const startDateTime = `${newSlot.startDate}T${newSlot.startTime}:00`;
        const endDateTime = `${newSlot.endDate}T${newSlot.endTime}:00`;

        if (isAfter(parseISO(startDateTime), parseISO(endDateTime))) {
            alert("End date/time must be after start date/time");
            return;
        }

        const slot: AvailabilitySlot = {
            id: crypto.randomUUID(),
            startDate: startDateTime,
            endDate: endDateTime,
            status: 'available',
            label: newSlot.label || undefined,
        };

        onChange([...slots, slot]);
        // Reset form
        setNewSlot({
            startDate: "",
            startTime: "09:00",
            endDate: "",
            endTime: "10:00",
            label: "",
        });
    };

    const handleRemoveSlot = (id: string) => {
        onChange(slots.filter((s) => s.id !== id));
    };

    const sortedSlots = [...slots].sort((a, b) =>
        parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
    );

    return (
        <CollapsibleSection
            title="TEMPORAL_ENGAGEMENT_MAP"
            description="Manage discrete calendar windows for client engagement and consultation protocols."
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="space-y-8 p-2">
                {/* Add New Slot Form */}
                <div className="nm-inset rounded-[2rem] p-8 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent opacity-30" />

                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                            <Plus size={18} />
                        </div>
                        <h4 className="text-[10px] font-black text-white tracking-[0.3em] uppercase">Initialize Temporal Window</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest pl-1">Start Initialization</label>
                            <div className="flex gap-4">
                                <input
                                    type="date"
                                    value={newSlot.startDate}
                                    onChange={(e) => setNewSlot({ ...newSlot, startDate: e.target.value })}
                                    className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono text-sm"
                                />
                                <input
                                    type="time"
                                    value={newSlot.startTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                    className="w-28 bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest pl-1">End Termination</label>
                            <div className="flex gap-4">
                                <input
                                    type="date"
                                    value={newSlot.endDate}
                                    onChange={(e) => setNewSlot({ ...newSlot, endDate: e.target.value })}
                                    className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono text-sm"
                                />
                                <input
                                    type="time"
                                    value={newSlot.endTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                    className="w-28 bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <FloatingLabelInput
                                label="Window Identifier (Optional)"
                                placeholder="e.g., Client Architecture Sync"
                                value={newSlot.label}
                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setNewSlot({ ...newSlot, label: e.target.value })}
                            />
                        </div>
                    </div>

                    <AdminButton
                        onClick={handleAddSlot}
                        className="w-full py-4 text-[11px]"
                        icon={Plus}
                    >
                        Append Temporal Slot
                    </AdminButton>
                </div>

                {/* List of Slots */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-black text-admin-text-muted tracking-[0.3em] uppercase">Active Configured Windows</h4>
                        <span className="text-[9px] font-mono text-purple-500/50">{sortedSlots.length} Slots Committed</span>
                    </div>

                    {sortedSlots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 nm-inset rounded-[2rem] text-admin-text-muted border border-dashed border-white/5">
                            <Calendar size={48} className="mb-4 opacity-10" />
                            <p className="text-[10px] font-bold uppercase tracking-widest opactiy-50">Empty Stack: No Slots Found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedSlots.map((slot, index) => (
                                <div
                                    key={slot.id}
                                    className="group flex items-center justify-between p-6 nm-inset rounded-3xl border border-transparent hover:border-white/5 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 nm-flat">
                                            <Clock size={20} />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-white">
                                                    {format(parseISO(slot.startDate), "PPP")}
                                                </span>
                                                {slot.label && (
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-black uppercase tracking-tighter">
                                                        {slot.label}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 font-mono text-[10px] text-admin-text-muted">
                                                <span className="text-purple-500/50 font-bold">INTERVAL:</span>
                                                <span>{format(parseISO(slot.startDate), "p")}</span>
                                                <span className="opacity-30">→</span>
                                                <span>{format(parseISO(slot.endDate), "p")}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSlot(slot.id)}
                                        className="p-3 rounded-xl bg-pink-500/5 text-pink-500 hover:bg-pink-500/10 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-start gap-4 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-blue-300/70 text-[10px] font-medium leading-relaxed tracking-wide">
                    <AlertCircle size={18} className="shrink-0 text-blue-400" />
                    <p className="uppercase tracking-tight">
                        PROTOCOL NOTICE: Availability slots are visualized on public interaction gateways to coordinate autonomous visitor scheduling and consultation requests.
                    </p>
                </div>
            </div>
        </CollapsibleSection>
    );
}
