import React from "react";
import { UseFormRegister, useFieldArray, Control } from "react-hook-form";
import { InsertSiteSettings } from "@portfolio/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { CollapsibleSection } from "./SectionsCommon";

interface WhyHireMeSectionProps {
  register: UseFormRegister<InsertSiteSettings>;
  control: Control<InsertSiteSettings>;
  isOpen: boolean;
  onToggle: () => void;
}

export function WhyHireMeSection({ register, control, isOpen, onToggle }: WhyHireMeSectionProps) {
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: "whyHireMeData.skills" as any,
  });

  const { fields: statFields, append: appendStat, remove: removeStat } = useFieldArray({
    control,
    name: "whyHireMeData.stats" as any,
  });

  return (
    <CollapsibleSection
      title="Why Hire Me Content"
      description="Manage the content for the 'Why Choose Me' section"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-6">
        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Main Description (CTA Section)</label>
          <Textarea
            {...register("whyHireMeData.description" as any)}
            placeholder="As a student, I bring fresh perspectives..."
            className="min-h-[100px] nm-inset bg-background/50 border-white/10"
          />
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Progress Stats (Grid Cards)</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendStat({ label: "New Stat", value: "Details..." })}
              className="h-8 gap-2 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Plus className="w-4 h-4" /> Add Stat
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statFields.map((field, index) => (
              <Card key={field.id} className="bg-white/5 border-white/10 relative group">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 w-7 h-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeStat(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Label</label>
                    <Input
                      {...register(`whyHireMeData.stats.${index}.label` as any)}
                      placeholder="e.g., Growth Mindset"
                      className="h-8 nm-inset bg-background/50 border-white/5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Value / Description</label>
                    <Input
                      {...register(`whyHireMeData.stats.${index}.value` as any)}
                      placeholder="e.g., Willingness to learn..."
                      className="h-8 nm-inset bg-background/50 border-white/5"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Skills List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Key Highlights (Checklist)</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendSkill("")}
              className="h-8 gap-2 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Plus className="w-4 h-4" /> Add Highlight
            </Button>
          </div>
          <div className="space-y-2">
            {skillFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Input
                  {...register(`whyHireMeData.skills.${index}` as any)}
                  placeholder="e.g., Passion for clean, maintainable code"
                    className="flex-1 nm-inset bg-background/50 border-white/10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSkill(index)}
                  className="text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
