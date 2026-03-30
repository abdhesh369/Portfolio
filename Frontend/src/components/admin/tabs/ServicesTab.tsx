/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, type FormEvent } from "react";
import { useServices, useAdminServices } from "#src/hooks/use-portfolio";
import { FormField, FormTextarea, EmptyState, AdminButton, FormCheckbox } from "#src/components/admin/AdminShared";
import { Plus, Trash2, Edit3, X, Zap, Cpu } from "lucide-react";
import type { Service } from "#shared/schema";

const emptyService = {
  title: "",
  summary: "",
  category: "",
  tagsInput: "",
  displayOrder: 0,
  isFeatured: false,
  priceMin: null as number | null,
  priceMax: null as number | null,
  ctaUrl: "",
};

import type { AdminTabProps } from "./types";

export function ServicesTab(_props: AdminTabProps) {
  const { data: services } = useServices();
  const { create, update, remove, isPending } = useAdminServices();
  const [editing, setEditing] = useState<(Partial<Service> & typeof emptyService) | null>(null);

  const openNew = () => {
    setEditing({ ...emptyService });
  };

  const openEdit = (svc: Service) => {
    setEditing({
      ...svc,
      tagsInput: (svc.tags ?? []).join(", "),
    } as any);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const tags = (editing.tagsInput || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const body: Partial<Service> & { tags?: string[] } = {
      title: editing.title,
      summary: editing.summary,
      category: editing.category,
      displayOrder: editing.displayOrder ?? 0,
      isFeatured: Boolean(editing.isFeatured),
      priceMin: editing.priceMin ? Number(editing.priceMin) : null,
      priceMax: editing.priceMax ? Number(editing.priceMax) : null,
      ctaUrl: editing.ctaUrl || null,
      tags,
    };

    if (editing.id) {
      await update({ id: editing.id, data: body });
    } else {
      await create(body);
    }
    setEditing(null);
  };

  const deleteService = async (id: number) => {
    if (!confirm("Delete this service?")) return;
    await remove(id);
  };

  if (editing) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 nm-inset rounded-2xl flex items-center justify-center text-purple-500">
              <Cpu size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase italic">
                {editing.id ? "Edit_Service" : "New_Service"}
              </h2>
              <p className="text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.3em] ml-1">
                Protocol: {editing.id ? `ID_${editing.id}` : "Allocation"}
              </p>
            </div>
          </div>
          <AdminButton
            onClick={() => setEditing(null)}
            variant="ghost"
            className="text-[var(--admin-text-secondary)] hover:text-rose-500"
          >
            <X size={16} className="mr-2" />
            Cancel_Task
          </AdminButton>
        </div>

        <form onSubmit={save} className="nm-flat p-10 space-y-10 max-w-4xl mx-auto">
          <FormField
            label="Title *"
            value={editing.title}
            onChange={(v) => setEditing(prev => prev ? { ...prev, title: v } : null)}
            required
          />
          <FormTextarea
            label="Summary *"
            value={editing.summary}
            onChange={(v) => setEditing(prev => prev ? { ...prev, summary: v } : null)}
            required
          />
          <FormField
            label="Category *"
            value={editing.category}
            onChange={(v) => setEditing(prev => prev ? { ...prev, category: v } : null)}
            placeholder="Backend, Systems, Consulting, etc."
            required
          />
          <FormField
            label="Tags (comma-separated)"
            value={editing.tagsInput}
            onChange={(v) => setEditing(prev => prev ? { ...prev, tagsInput: v } : null)}
            placeholder="backend, scaling, architecture"
          />
          <div className="grid md:grid-cols-2 gap-10">
            <FormField
              label="Display Order"
              type="number"
              value={String(editing.displayOrder ?? 0)}
              onChange={(v) =>
                setEditing(prev => prev ? { ...prev, displayOrder: Number(v) || 0 } : null)
              }
            />
            <div className="pt-8">
              <FormCheckbox
                label="Highlight as featured service"
                checked={Boolean(editing.isFeatured)}
                onChange={(checked) =>
                  setEditing(prev => prev ? { ...prev, isFeatured: checked } : null)
                }
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <FormField
              label="Minimum Price ($)"
              type="number"
              value={editing.priceMin?.toString() || ""}
              onChange={(v) =>
                setEditing(prev => prev ? { ...prev, priceMin: v ? Number(v) : null } : null)
              }
            />
            <FormField
              label="Maximum Price ($)"
              type="number"
              value={editing.priceMax?.toString() || ""}
              onChange={(v) =>
                setEditing(prev => prev ? { ...prev, priceMax: v ? Number(v) : null } : null)
              }
            />
            <FormField
              label="CTA URL (Booking Link)"
              value={editing.ctaUrl || ""}
              onChange={(v) =>
                setEditing(prev => prev ? { ...prev, ctaUrl: v } : null)
              }
              placeholder="https://cal.com/..."
            />
          </div>

          <div className="flex gap-6 pt-6 border-t border-black/5">
            <AdminButton type="submit" variant="primary" className="flex-1 h-14" isLoading={isPending}>
              {editing.id ? "Update_Protocol" : "Initialize_Service"}
            </AdminButton>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 nm-inset rounded-xl flex items-center justify-center text-purple-500">
              <Zap size={20} strokeWidth={3} />
            </div>
            <h1 className="text-4xl font-black text-[var(--admin-text-primary)] tracking-tighter uppercase italic">
              Services
            </h1>
          </div>
          <p className="text-[var(--admin-text-secondary)] text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-3 ml-1">
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_var(--nm-accent)]" />
            Registry_Index: {services?.length ?? 0}
          </p>
        </div>
        <AdminButton onClick={openNew} variant="primary" className="h-14 px-10">
          <Plus size={20} strokeWidth={3} className="mr-3" />
          New_Service
        </AdminButton>
      </div>

      {!services?.length ? (
        <EmptyState icon={Zap} text="No services defined yet" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="nm-flat p-6 flex flex-col gap-6 group transition-all relative overflow-hidden"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="text-sm font-black text-[var(--admin-text-primary)] uppercase tracking-tight">{svc.title}</h4>
                  {svc.isFeatured && (
                    <div className="px-2 py-0.5 rounded text-[8px] font-black border border-amber-400/40 text-amber-300 bg-amber-500/10 tracking-widest uppercase">
                      Featured
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">{svc.category}</p>
                <p className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-1">
                  Order_Index: {svc.displayOrder ?? 0}
                  {svc.priceMin && ` | Starting_At: $${svc.priceMin}`}
                  {svc.ctaUrl && ` | Has_Booking_Link`}
                </p>
                <p className="text-xs text-[var(--admin-text-secondary)] mt-4 line-clamp-2 leading-relaxed">
                  {svc.summary}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {(svc.tags ?? []).slice(0, 6).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded text-[8px] font-black nm-inset text-[var(--admin-text-muted)] tracking-widest uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <AdminButton
                  onClick={() => openEdit(svc)}
                  variant="secondary"
                  icon={Edit3}
                  size="sm"
                  className="w-10 h-10 nm-button rounded-xl text-indigo-500 hover:scale-110 flex items-center justify-center transition-all"
                  title="Edit"
                >
                </AdminButton>
                <AdminButton
                  onClick={() => deleteService(svc.id)}
                  variant="secondary"
                  icon={Trash2}
                  size="sm"
                  className="w-10 h-10 nm-button rounded-xl text-rose-500 hover:scale-110 flex items-center justify-center transition-all"
                  title="Delete"
                >
                </AdminButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
