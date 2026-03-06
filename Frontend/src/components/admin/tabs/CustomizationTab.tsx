import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/use-site-settings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/admin/AdminShared";
import { ChevronDown, Download, Upload, RotateCcw, Save, AlertCircle } from "lucide-react";
import type { InsertSiteSettings } from "@shared/schema";

// --- Types & Constants ---

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const DEFAULT_SETTINGS: Partial<InsertSiteSettings> = {
  isOpenToWork: true,
  personalName: "Your Name",
  personalTitle: "Full Stack Developer",
  personalBio: "Passionate about building amazing products",
  heroGreeting: "Hey, I am",
  heroBadgeText: "Available for work",
  heroCtaPrimary: "View My Work",
  heroCtaPrimaryUrl: "#projects",
  heroCtaSecondary: "Get In Touch",
  heroCtaSecondaryUrl: "#contact",
  colorBackground: "hsl(224, 71%, 4%)",
  colorSurface: "hsl(224, 71%, 10%)",
  fontDisplay: "Inter",
  fontBody: "Inter",
  footerCopyright: `© ${new Date().getFullYear()} Your Name. All rights reserved.`,
  footerTagline: "Building the future, one line of code at a time.",
  featureBlog: true,
  featureGuestbook: true,
  featureTestimonials: true,
  featureServices: true,
  featurePlayground: false,
};

// --- Sub-Components ---

function CollapsibleSection({ title, isOpen, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <ChevronDown
          size={20}
          className={`text-white/60 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen ? "max-h-[2000px]" : "max-h-0"}`}
      >
        <div className="p-4 space-y-4 bg-white/[0.02] border-t border-white/5">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export function CustomizationTab() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateMutation = useUpdateSiteSettings();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // useForm with 'values' ensures the form updates when async data arrives
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<InsertSiteSettings>({
    defaultValues: settings || DEFAULT_SETTINGS,
    values: settings,
  });

  // Manage which section is currently expanded
  const [activeSection, setActiveSection] = useState<string | null>("personal");

  const toggleSection = (id: string) => {
    setActiveSection(activeSection === id ? null : id);
  };

  const onSubmit = async (data: InsertSiteSettings) => {
    try {
      await updateMutation.mutateAsync(data);
      toast({ title: "Success", description: "Settings updated successfully" });
      reset(data); // Reset dirty state to current values
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    if (!settings) return;
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `portfolio-settings-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export Complete", description: "Settings saved to JSON file" });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);

        // Basic Validation: Ensure it's a settings object
        if (typeof imported !== 'object' || !imported.personalName) {
          throw new Error("Invalid format: Missing required fields.");
        }

        reset(imported);
        toast({ title: "Import Successful", description: "Settings loaded into form. Don't forget to save!" });
      } catch (err: any) {
        toast({
          title: "Import Failed",
          description: err.message || "Invalid JSON file",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Clear input
  };

  const handleReset = () => {
    if (confirm("Are you sure? This will revert all fields to factory defaults but won't save until you click 'Save Changes'.")) {
      reset(DEFAULT_SETTINGS as InsertSiteSettings);
      toast({ title: "Reset Applied", description: "Defaults loaded into form." });
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Customization</h2>
          <p className="text-white/40 text-sm mt-1">Configure your branding, layout, and toggles.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="text-white/70">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-white/70"
          >
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>

          <Button variant="outline" size="sm" onClick={handleReset} className="text-white/70 hover:text-red-400">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* SECTION: Personal Branding */}
        <CollapsibleSection
          title="Personal Branding"
          isOpen={activeSection === "personal"}
          onToggle={() => toggleSection("personal")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase">Full Name</label>
              <input {...register("personalName")} className="admin-input" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase">Professional Title</label>
              <input {...register("personalTitle")} className="admin-input" placeholder="Software Engineer" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase">Bio</label>
              <textarea {...register("personalBio")} rows={3} className="admin-input resize-none" />
            </div>
          </div>
        </CollapsibleSection>

        {/* SECTION: Social Links */}
        <CollapsibleSection
          title="Social Presence"
          isOpen={activeSection === "social"}
          onToggle={() => toggleSection("social")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              { id: "socialGithub", label: "GitHub" },
              { id: "socialLinkedin", label: "LinkedIn" },
              { id: "socialTwitter", label: "Twitter / X" },
            ] as const).map((social) => (
              <div key={social.id} className="space-y-2">
                <label className="text-xs font-medium text-white/50 uppercase">{social.label}</label>
                <input {...register(social.id)} type="url" className="admin-input" placeholder="https://..." />
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* SECTION: Appearance */}
        <CollapsibleSection
          title="Theme & Colors"
          isOpen={activeSection === "appearance"}
          onToggle={() => toggleSection("appearance")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase">Background (HSL)</label>
              <input {...register("colorBackground")} className="admin-input font-mono" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase">Surface (HSL)</label>
              <input {...register("colorSurface")} className="admin-input font-mono" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase">Custom CSS Injector</label>
              <textarea {...register("customCss")} rows={4} className="admin-input font-mono text-xs" placeholder=".my-class { color: red; }" />
            </div>
          </div>
        </CollapsibleSection>

        {/* SECTION: Feature Toggles */}
        <CollapsibleSection
          title="Active Features"
          isOpen={activeSection === "features"}
          onToggle={() => toggleSection("features")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              { id: "featureBlog", label: "Enable Blog Section" },
              { id: "featureGuestbook", label: "Enable Guestbook" },
              { id: "featureServices", label: "Enable Services" },
              { id: "featurePlayground", label: "Enable Lab/Playground" },
            ] as const).map((feature) => (
              <label key={feature.id} className="flex items-center p-3 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/30 cursor-pointer transition-colors">
                <input {...register(feature.id)} type="checkbox" className="w-4 h-4 rounded border-white/20 bg-transparent text-purple-600 focus:ring-purple-500" />
                <span className="ml-3 text-sm text-white/80">{feature.label}</span>
              </label>
            ))}
          </div>
        </CollapsibleSection>

        {/* Sticky Form Footer */}
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-white/10 p-4 -mx-4 mt-8 flex items-center gap-4">
          <Button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            className="bg-purple-600 hover:bg-purple-500 text-white px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>

          {isDirty && (
            <span className="text-yellow-400 text-sm flex items-center animate-pulse">
              <AlertCircle className="w-4 h-4 mr-2" />
              You have unsaved changes
            </span>
          )}
        </div>
      </form>

      {/* Tailwind Utility for shared styles (you can move this to your globals.css) */}
      <style>{`
        .admin-input {
          @apply w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-white/20;
        }
      `}</style>
    </div>
  );
}

export default CustomizationTab;