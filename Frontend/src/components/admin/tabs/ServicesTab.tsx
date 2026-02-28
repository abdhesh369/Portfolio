import React, { useState, type FormEvent } from "react";
import { useServices } from "@/hooks/use-portfolio";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-helpers";
import { FormField, FormTextarea, EmptyState } from "@/components/admin/AdminShared";
import type { Service } from "@shared/schema";

const emptyService = {
  title: "",
  summary: "",
  category: "",
  tagsInput: "",
  displayOrder: 0,
  isFeatured: false,
};

export function ServicesTab({ token }: { token: string | null }) {
  const { data: services, refetch } = useServices();
  const { toast } = useToast();
  const [editing, setEditing] = useState<(Partial<Service> & typeof emptyService) | null>(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing({ ...emptyService });
  };

  const openEdit = (svc: Service) => {
    setEditing({
      ...svc,
      tagsInput: (svc.tags ?? []).join(", "),
    });
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);

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
      tags,
    };

    try {
      if (editing.id) {
        await apiFetch(`/api/services/${editing.id}`, token, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        toast({ title: "Service updated" });
      } else {
        await apiFetch("/api/services", token, {
          method: "POST",
          body: JSON.stringify(body),
        });
        toast({ title: "Service created" });
      }
      setEditing(null);
      refetch();
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm("Delete this service?")) return;
    try {
      await apiFetch(`/api/services/${id}`, token, { method: "DELETE" });
      toast({ title: "Service deleted" });
      refetch();
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (editing) {
    return (
      <div className="animate-fade-in">
        <h2
          className="text-2xl font-bold text-white mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {editing.id ? "Edit Service" : "New Service"}
        </h2>
        <form onSubmit={save} className="space-y-4 max-w-2xl">
          <FormField
            label="Title *"
            value={editing.title}
            onChange={(v) => setEditing({ ...editing, title: v })}
            required
          />
          <FormTextarea
            label="Summary *"
            value={editing.summary}
            onChange={(v) => setEditing({ ...editing, summary: v })}
            required
          />
          <FormField
            label="Category *"
            value={editing.category}
            onChange={(v) => setEditing({ ...editing, category: v })}
            placeholder="Backend, Systems, Consulting, etc."
            required
          />
          <FormField
            label="Tags (comma-separated)"
            value={editing.tagsInput}
            onChange={(v) => setEditing({ ...editing, tagsInput: v })}
            placeholder="backend, scaling, architecture"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Display Order"
              type="number"
              value={String(editing.displayOrder ?? 0)}
              onChange={(v) =>
                setEditing({ ...editing, displayOrder: Number(v) || 0 })
              }
            />
            <label className="inline-flex items-center gap-2 text-xs text-white/70 mt-6">
              <input
                type="checkbox"
                className="rounded border-white/30 bg-transparent"
                checked={Boolean(editing.isFeatured)}
                onChange={(e) =>
                  setEditing({ ...editing, isFeatured: e.target.checked })
                }
              />
              Highlight as featured service
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editing.id ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(null)}
              className="text-white/50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Services{" "}
          <Badge variant="secondary" className="ml-2">
            {services?.length ?? 0}
          </Badge>
        </h2>
        <Button size="sm" onClick={openNew}>
          + Add Service
        </Button>
      </div>

      {!services?.length ? (
        <EmptyState icon="🛠️" text="No services defined yet" />
      ) : (
        <div className="space-y-3">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="rounded-xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-start gap-4 group hover:border-white/20 transition-colors"
              style={{ background: "hsl(222 47% 11% / 0.5)" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-white text-sm">{svc.title}</p>
                  {svc.isFeatured && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-amber-400/40 text-amber-300 bg-amber-500/10"
                    >
                      Featured
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-purple-400">{svc.category}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Order: {svc.displayOrder ?? 0}
                </p>
                <p className="text-sm text-white/60 mt-2 line-clamp-2">
                  {svc.summary}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(svc.tags ?? []).slice(0, 6).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/60 border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(svc)}
                  className="text-white/60"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteService(svc.id)}
                  className="opacity-60 group-hover:opacity-100"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

