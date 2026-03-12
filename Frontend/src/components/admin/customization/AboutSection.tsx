import React from "react";
import { UseFormRegister, useFieldArray, Control } from "react-hook-form";
import { InsertSiteSettings } from "@portfolio/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calendar, Target, Zap } from "lucide-react";
import { CollapsibleSection } from "./SectionsCommon";

interface AboutSectionProps {
  register: UseFormRegister<InsertSiteSettings>;
  control: Control<InsertSiteSettings>;
  isOpen: boolean;
  onToggle: () => void;
}

export function AboutSection({ register, control, isOpen, onToggle }: AboutSectionProps) {
  const { fields: techFields, append: appendTech, remove: removeTech } = useFieldArray({
    control,
    name: "aboutTechStack" as any,
  });

  const { fields: timelineFields, append: appendTimeline, remove: removeTimeline } = useFieldArray({
    control,
    name: "aboutTimeline" as any,
  });

  return (
    <CollapsibleSection
      title="About Me Section"
      description="Customize your bio, availability, tech stack, and development timeline."
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-8">
        {/* Availability & Brief Bio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Availability Status</label>
            <Input
              {...register("aboutAvailability" as any)}
              placeholder="e.g., Open to Work, Freelance Only"
              className="nm-inset bg-background/50 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Personal Bio (Introduction)</label>
            <Textarea
              {...register("personalBio" as any)}
              placeholder="Short catchy introduction..."
              className="min-h-[80px] nm-inset bg-background/50 border-white/10"
            />
          </div>
        </div>

        {/* Long Description / About Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Main About Description (Detailed Paragraphs)</label>
          <Textarea
            {...register("aboutDescription" as any)}
            placeholder="Tell your story here. Highlighting your journey, goals, and expertise."
            className="min-h-[200px] nm-inset bg-background/50 border-white/10 font-mono text-sm"
          />
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-1">Tip: Use double newlines to separate paragraphs in the UI.</p>
        </div>

        {/* Tech Stack Tags */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Core Tech Stack (Tags)
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendTech("")}
              className="h-8 gap-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Plus className="w-4 h-4" /> Add Tech
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {techFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Input
                  {...register(`aboutTechStack.${index}` as any)}
                  placeholder="e.g., React"
                  className="w-32 h-9 nm-inset bg-background/50 border-white/10 text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTech(index)}
                  className="w-8 h-8 text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              Development Log (Timeline)
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendTimeline({ year: "202X", title: "New Milestone", description: "Brief details..." })}
              className="h-8 gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <Plus className="w-4 h-4" /> Add Event
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {timelineFields.map((field, index) => (
              <Card key={field.id} className="bg-white/5 border-white/10 relative group">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 w-7 h-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeTimeline(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Year / Period</label>
                    <Input
                      {...register(`aboutTimeline.${index}.year` as any)}
                      placeholder="e.g., 2024 - Present"
                      className="h-9 nm-inset bg-background/50 border-white/5 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Event Title</label>
                    <Input
                      {...register(`aboutTimeline.${index}.title` as any)}
                      placeholder="e.g., Advanced System Design"
                      className="h-9 nm-inset bg-background/50 border-white/5 text-sm"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Description</label>
                    <Textarea
                      {...register(`aboutTimeline.${index}.description` as any)}
                      placeholder="Describe the milestone..."
                      className="min-h-[60px] nm-inset bg-background/50 border-white/5 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
