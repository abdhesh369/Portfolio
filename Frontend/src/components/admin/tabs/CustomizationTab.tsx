import React, { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/use-site-settings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/admin/AdminShared";
import { ChevronDown, Download, Upload, RotateCcw, Save, AlertCircle, Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { InsertSiteSettings } from "@shared/schema";
import { insertSiteSettingsApiSchema } from "@shared/schema";

// --- Types & Constants ---

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

interface SortableItemProps {
  id: string;
  children: (props: any) => React.ReactNode;
}

const DEFAULT_SETTINGS: Partial<InsertSiteSettings> = {
  isOpenToWork: true,
  personalName: "Your Name",
  personalTitle: "Full Stack Developer",
  personalBio: "Passionate about building amazing products",
  heroGreeting: "Hey, I am",
  heroBadgeText: "Available for work",
  heroTaglines: ["Building amazing products", "Solving complex problems"],
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
  socialEmail: "abdheshshah111@gmail.com",
  featureBlog: true,
  featureGuestbook: true,
  featureTestimonials: true,
  featureServices: true,
  featurePlayground: false,
  navbarLinks: [
    { label: "Home", href: "/", icon: "home" },
    { label: "Skills", href: "#skills", icon: "zap" },
    { label: "Projects", href: "#projects", icon: "folder" },
    { label: "Experience", href: "#experience", icon: "briefcase" },
    { label: "Blog", href: "/blog", icon: "book" },
    { label: "Contact", href: "#contact", icon: "mail" },
  ],
  sectionOrder: ["about", "skills", "whyhireme", "services", "mindset", "projects", "practice", "experience", "testimonials", "guestbook", "contact"],
  sectionVisibility: { hero: true, about: true, projects: true, skills: true, testimonials: true, contact: true }
};

// --- Sub-Components ---

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 60 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({ attributes, listeners, isDragging })}
    </div>
  );
}

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
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen ? "max-h-[3000px]" : "max-h-0"}`}
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

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // useForm with 'values' ensures the form updates when async data arrives
  const { register, control, handleSubmit, reset, setValue, watch, formState: { isDirty, errors } } = useForm<InsertSiteSettings>({
    defaultValues: settings || DEFAULT_SETTINGS,
    values: settings,
  });

  const { fields: taglineFields, append: appendTagline, remove: removeTagline } = useFieldArray({
    control,
    name: "heroTaglines" as any,
  });

  const { fields: navFields, append: appendNav, remove: removeNav, move: moveNav } = useFieldArray({
    control,
    name: "navbarLinks" as any,
  });

  const { fields: sectionOrderFields, move: moveSection } = useFieldArray({
    control,
    name: "sectionOrder" as any,
  });

  const handleNavDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = navFields.findIndex((f) => f.id === active.id);
      const newIndex = navFields.findIndex((f) => f.id === over.id);
      moveNav(oldIndex, newIndex);
    }
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sectionOrderFields.findIndex((f) => f.id === active.id);
      const newIndex = sectionOrderFields.findIndex((f) => f.id === over.id);
      moveSection(oldIndex, newIndex);
    }
  };

  // Section ID to Label mapping for better UX
  const SECTION_LABELS: Record<string, string> = {
    hero: "Hero / Intro",
    about: "About Me",
    skills: "Skills / Expertise",
    whyhireme: "Why Hire Me",
    services: "Services Offered",
    mindset: "Developer Mindset",
    projects: "Featured Projects",
    practice: "Lab / Practice",
    experience: "Work Experience",
    testimonials: "Testimonials",
    guestbook: "Public Guestbook",
    contact: "Contact Form",
    blog: "Latest Articles"
  };

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
        const result = event.target?.result as string;
        const imported = JSON.parse(result);

        // Validation using shared Zod schema
        const parseResult = insertSiteSettingsApiSchema.safeParse(imported);

        if (!parseResult.success) {
          const errorMsg = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(", ");
          throw new Error(`Invalid format: ${errorMsg}`);
        }

        reset(parseResult.data);
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
    <div className="animate-in fade-in duration-500 space-y-6 pb-24">
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
            id="import-settings"
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
              <label htmlFor="personalName" className="text-xs font-medium text-white/50 uppercase">Full Name</label>
              <input id="personalName" {...register("personalName")} className="admin-input" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label htmlFor="personalTitle" className="text-xs font-medium text-white/50 uppercase">Professional Title</label>
              <input id="personalTitle" {...register("personalTitle")} className="admin-input" placeholder="Software Engineer" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="personalBio" className="text-xs font-medium text-white/50 uppercase">Bio</label>
              <textarea id="personalBio" {...register("personalBio")} rows={3} className="admin-input resize-none" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="personalAvatar" className="text-xs font-medium text-white/50 uppercase">Avatar URL</label>
              <input id="personalAvatar" {...register("personalAvatar")} type="url" className="admin-input" placeholder="https://..." />
            </div>
          </div>
        </CollapsibleSection>

        {/* SECTION: Social Links */}
        <CollapsibleSection
          title="Social Presence"
          isOpen={activeSection === "social"}
          onToggle={() => toggleSection("social")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {([
              { id: "socialGithub", label: "GitHub" },
              { id: "socialLinkedin", label: "LinkedIn" },
              { id: "socialTwitter", label: "Twitter / X" },
              { id: "socialInstagram", label: "Instagram" },
              { id: "socialFacebook", label: "Facebook" },
              { id: "socialYoutube", label: "YouTube" },
              { id: "socialDiscord", label: "Discord" },
              { id: "socialStackoverflow", label: "StackOverflow" },
              { id: "socialDevto", label: "Dev.to" },
              { id: "socialMedium", label: "Medium" },
              { id: "socialEmail", label: "Contact Email" },
            ] as const).map((social) => (
              <div key={social.id} className="space-y-2">
                <label htmlFor={social.id} className="text-xs font-medium text-white/50 uppercase">{social.label}</label>
                <input id={social.id} {...register(social.id as any)} type="url" className="admin-input" placeholder="https://..." />
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* SECTION: Hero Content */}
        <CollapsibleSection
          title="Hero Section"
          isOpen={activeSection === "hero"}
          onToggle={() => toggleSection("hero")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="heroGreeting" className="text-xs font-medium text-white/50 uppercase">Greeting Text</label>
              <input id="heroGreeting" {...register("heroGreeting")} className="admin-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="heroBadgeText" className="text-xs font-medium text-white/50 uppercase">Badge Text</label>
              <input id="heroBadgeText" {...register("heroBadgeText")} className="admin-input" />
            </div>
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/50 uppercase">Dynamic Taglines</label>
                <Button type="button" variant="outline" size="sm" onClick={() => appendTagline("")} className="h-7 text-[10px]">
                  <Plus className="w-3 h-3 mr-1" /> Add Tagline
                </Button>
              </div>
              <div className="space-y-2">
                {taglineFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...register(`heroTaglines.${index}` as any)}
                      className="admin-input"
                      placeholder="e.g. Building high-performance apps"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTagline(index)}
                      className="text-white/30 hover:text-red-400 hover:bg-red-400/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* SECTION: Hero CTAs */}
        <CollapsibleSection
          title="Hero Call-to-Actions"
          isOpen={activeSection === "ctas"}
          onToggle={() => toggleSection("ctas")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-4">
              <h4 className="text-sm font-semibold text-purple-400">Primary CTA</h4>
              <div className="space-y-2">
                <label htmlFor="heroCtaPrimary" className="text-xs font-medium text-white/50 uppercase">Label</label>
                <input id="heroCtaPrimary" {...register("heroCtaPrimary")} className="admin-input" />
              </div>
              <div className="space-y-2">
                <label htmlFor="heroCtaPrimaryUrl" className="text-xs font-medium text-white/50 uppercase">URL / Hash</label>
                <input id="heroCtaPrimaryUrl" {...register("heroCtaPrimaryUrl")} className="admin-input" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-4">
              <h4 className="text-sm font-semibold text-cyan-400">Secondary CTA</h4>
              <div className="space-y-2">
                <label htmlFor="heroCtaSecondary" className="text-xs font-medium text-white/50 uppercase">Label</label>
                <input id="heroCtaSecondary" {...register("heroCtaSecondary")} className="admin-input" />
              </div>
              <div className="space-y-2">
                <label htmlFor="heroCtaSecondaryUrl" className="text-xs font-medium text-white/50 uppercase">URL / Hash</label>
                <input id="heroCtaSecondaryUrl" {...register("heroCtaSecondaryUrl")} className="admin-input" />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* SECTION: Navbar */}
        <CollapsibleSection
          title="Navbar Configuration"
          isOpen={activeSection === "navbar"}
          onToggle={() => toggleSection("navbar")}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/40">Manage your site's navigation menu.</p>
              <Button type="button" variant="outline" size="sm" onClick={() => appendNav({ label: "New Link", href: "#", icon: "link" })} className="h-7 text-[10px]">
                <Plus className="w-3 h-3 mr-1" /> Add Link
              </Button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleNavDragEnd}
            >
              <SortableContext
                items={navFields.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {navFields.map((field, index) => (
                    <SortableItem key={field.id} id={field.id}>
                      {({ attributes, listeners, isDragging }: any) => (
                        <div className={`flex flex-col md:flex-row gap-2 p-3 rounded-lg bg-white/5 border transition-colors group ${isDragging ? "border-purple-500/50 bg-white/10 shadow-xl" : "border-white/5"}`}>
                          <div className="flex items-center gap-2 grow">
                            <div
                              className="text-white/20 group-hover:text-white/40 cursor-grab px-1 active:cursor-grabbing"
                              {...attributes}
                              {...listeners}
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 grow">
                              <input
                                {...register(`navbarLinks.${index}.label` as any)}
                                className="admin-input h-9"
                                placeholder="Label"
                              />
                              <input
                                {...register(`navbarLinks.${index}.href` as any)}
                                className="admin-input h-9"
                                placeholder="Href (e.g. #projects)"
                              />
                              <input
                                {...register(`navbarLinks.${index}.icon` as any)}
                                className="admin-input h-9 md:col-span-1 col-span-2"
                                placeholder="Icon name (lucide)"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 shrink-0">
                            <div className="flex gap-1 md:flex-col">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={index === 0}
                                onClick={() => moveNav(index, index - 1)}
                                className="text-white/30 h-7 w-7"
                              >
                                <ChevronDown className="w-4 h-4 rotate-180" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={index === navFields.length - 1}
                                onClick={() => moveNav(index, index + 1)}
                                className="text-white/30 h-7 w-7"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeNav(index)}
                              className="text-white/30 hover:text-red-400 hover:bg-red-400/10 h-9 w-9 self-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </CollapsibleSection>

        {/* SECTION: Appearance */}
        <CollapsibleSection
          title="Theme & Typography"
          isOpen={activeSection === "appearance"}
          onToggle={() => toggleSection("appearance")}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="colorBackground" className="text-xs font-medium text-white/50 uppercase">Background (HSL)</label>
              <input id="colorBackground" {...register("colorBackground")} className="admin-input font-mono" placeholder="hsl(224, 71%, 4%)" />
            </div>
            <div className="space-y-2">
              <label htmlFor="colorSurface" className="text-xs font-medium text-white/50 uppercase">Surface (HSL)</label>
              <input id="colorSurface" {...register("colorSurface")} className="admin-input font-mono" placeholder="hsl(224, 71%, 10%)" />
            </div>
            <div className="space-y-2">
              <label htmlFor="fontDisplay" className="text-xs font-medium text-white/50 uppercase">Display Font (Google Fonts)</label>
              <input id="fontDisplay" {...register("fontDisplay")} className="admin-input" placeholder="Inter" />
            </div>
            <div className="space-y-2">
              <label htmlFor="fontBody" className="text-xs font-medium text-white/50 uppercase">Body Font (Google Fonts)</label>
              <input id="fontBody" {...register("fontBody")} className="admin-input" placeholder="Inter" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="customCss" className="text-xs font-medium text-white/50 uppercase">Custom CSS Injector</label>
              <textarea id="customCss" {...register("customCss")} rows={4} className="admin-input font-mono text-xs" placeholder=".my-class { color: red; }" />
              <p className="text-[10px] text-white/30 italic">Unsafe constructs like url() and @import will be stripped server-side.</p>
            </div>
          </div>
        </CollapsibleSection>

        {/* SECTION: Footer */}
        <CollapsibleSection
          title="Footer Configuration"
          isOpen={activeSection === "footer"}
          onToggle={() => toggleSection("footer")}
        >
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label htmlFor="footerCopyright" className="text-xs font-medium text-white/50 uppercase">Copyright Text</label>
              <input id="footerCopyright" {...register("footerCopyright")} className="admin-input" />
            </div>
            <div className="space-y-2">
              <label htmlFor="footerTagline" className="text-xs font-medium text-white/50 uppercase">Footer Tagline</label>
              <input id="footerTagline" {...register("footerTagline")} className="admin-input" />
            </div>
          </div>
        </CollapsibleSection>

        {/* SECTION: Section Management */}
        <CollapsibleSection
          title="Section Layout & Visibility"
          isOpen={activeSection === "sections"}
          onToggle={() => toggleSection("sections")}
        >
          <div className="space-y-4">
            <p className="text-xs text-white/40 italic">
              Drag sections to reorder how they appear on your homepage. Use the toggle to hide/show sections.
            </p>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <SortableContext
                items={sectionOrderFields.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sectionOrderFields.map((field: any, index) => {
                    const sectionId = settings?.sectionOrder?.[index] || field.id;
                    const label = SECTION_LABELS[sectionId] || sectionId;

                    return (
                      <SortableItem key={field.id} id={field.id}>
                        {({ attributes, listeners, isDragging }: any) => (
                          <div className={`flex items-center gap-3 p-3 rounded-lg bg-white/5 border transition-colors group ${isDragging ? "border-purple-500/50 bg-white/10 shadow-xl" : "border-white/5 hover:border-purple-500/30"}`}>
                            <div
                              className="text-white/20 group-hover:text-white/40 cursor-grab px-1 active:cursor-grabbing"
                              {...attributes}
                              {...listeners}
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <span className="text-sm font-medium text-white/80 grow">{label}</span>

                            <div className="flex items-center gap-4">
                              {/* Visibility Toggle */}
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  {...register(`sectionVisibility.${sectionId}` as any)}
                                  className="sr-only peer"
                                />
                                <div className="relative w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white"></div>
                              </label>

                              {/* Move Buttons (Fallback for DND) */}
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={index === 0}
                                  onClick={() => moveSection(index, index - 1)}
                                  className="text-white/30 h-7 w-7"
                                >
                                  <ChevronDown className="w-3 h-3 rotate-180" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={index === sectionOrderFields.length - 1}
                                  onClick={() => moveSection(index, index + 1)}
                                  className="text-white/30 h-7 w-7"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </SortableItem>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
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
              { id: "featureTestimonials", label: "Enable Testimonials" },
              { id: "featurePlayground", label: "Enable Lab/Playground" },
            ] as const).map((feature) => (
              <label key={feature.id} htmlFor={feature.id} className="flex items-center p-3 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/30 cursor-pointer transition-colors">
                <input id={feature.id} {...register(feature.id as any)} type="checkbox" className="w-4 h-4 rounded border-white/20 bg-transparent text-purple-600 focus:ring-purple-500" />
                <span className="ml-3 text-sm text-white/80">{feature.label}</span>
              </label>
            ))}
          </div>
        </CollapsibleSection>

        {/* Sticky Form Footer */}
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-white/10 p-4 -mx-4 mt-8 flex items-center gap-4 z-50">
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
    </div>
  );
}

export default CustomizationTab;