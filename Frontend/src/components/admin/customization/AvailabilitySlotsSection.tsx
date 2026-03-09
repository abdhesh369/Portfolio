import React, { useState } from "react";
import { Plus, Trash2, Calendar, Clock, AlertCircle } from "lucide-react";
import { CollapsibleSection } from "./SectionsCommon";
import { format, isAfter, parseISO } from "date-fns";

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
        <CollapsibleSection title="Availability Calendar" isOpen={isOpen} onToggle={onToggle}>
            <div className="space-y-6">
                {/* Add New Slot Form */}
                <div className="nm-inset border border-transparent rounded-lg p-4 space-y-4">
                    <h4 className="text-sm font-medium text-admin-text-primary flex items-center gap-2">
                        <Plus size={16} />
                        Add New Availability Slot
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-admin-text-muted uppercase tracking-wider font-bold">Start Date & Time</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={newSlot.startDate}
                                    onChange={(e) => setNewSlot({ ...newSlot, startDate: e.target.value })}
                                    className="flex-1 bg-transparent border border-transparent rounded px-3 py-2 text-admin-text-primary focus:outline-none focus:border-purple-500/50"
                                />
                                <input
                                    type="time"
                                    value={newSlot.startTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                    className="w-24 bg-transparent border border-transparent rounded px-3 py-2 text-admin-text-primary focus:outline-none focus:border-purple-500/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-admin-text-muted uppercase tracking-wider font-bold">End Date & Time</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={newSlot.endDate}
                                    onChange={(e) => setNewSlot({ ...newSlot, endDate: e.target.value })}
                                    className="flex-1 bg-transparent border border-transparent rounded px-3 py-2 text-admin-text-primary focus:outline-none focus:border-purple-500/50"
                                />
                                <input
                                    type="time"
                                    value={newSlot.endTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                    className="w-24 bg-transparent border border-transparent rounded px-3 py-2 text-admin-text-primary focus:outline-none focus:border-purple-500/50"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs text-admin-text-muted uppercase tracking-wider font-bold">Label (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g., Client Meeting, Project Sync"
                                value={newSlot.label}
                                onChange={(e) => setNewSlot({ ...newSlot, label: e.target.value })}
                                className="w-full bg-transparent border border-transparent rounded px-3 py-2 text-admin-text-primary focus:outline-none focus:border-purple-500/50"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddSlot}
                        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-admin-text-primary font-medium py-2 px-4 rounded transition-colors"
                    >
                        <Plus size={18} />
                        Add Slot
                    </button>
                </div>

                {/* List of Slots */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-admin-text-primary">Configured Slots</h4>
                    {sortedSlots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-transparent rounded-lg text-admin-text-muted">
                            <Calendar size={32} className="mb-2 opacity-20" />
                            <p className="text-sm">No availability slots configured yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {sortedSlots.map((slot) => (
                                <div
                                    key={slot.id}
                                    className="group flex items-center justify-between p-3 nm-inset border border-transparent rounded-lg hover:border-admin-text-muted/30 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-purple-500/10 p-2 rounded text-purple-400">
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-admin-text-primary">
                                                    {format(parseISO(slot.startDate), "PPP")}
                                                </span>
                                                {slot.label && (
                                                    <span className="text-[10px] px-1.5 py-0.5 nm-inset rounded text-admin-text-secondary uppercase font-bold tracking-tight">
                                                        {slot.label}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-admin-text-muted">
                                                {format(parseISO(slot.startDate), "p")} - {format(parseISO(slot.endDate), "p")}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSlot(slot.id)}
                                        className="p-2 text-admin-text-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300 text-xs leading-relaxed">
                    <AlertCircle size={16} className="shrink-0" />
                    <p>
                        Availability slots are used on your public contact page to let visitors know when you're available for a chat or work.
                    </p>
                </div>
            </div>
        </CollapsibleSection>
    );
}
