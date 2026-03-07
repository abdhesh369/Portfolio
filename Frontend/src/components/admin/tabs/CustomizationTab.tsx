import React, { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/use-site-settings";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/admin/AdminShared";
import { DragEndEvent } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import type { InsertSiteSettings } from "@portfolio/shared";
import { insertSiteSettingsApiSchema } from "@portfolio/shared";

// Sub-components
import { CustomizationHeader } from "../customization/CustomizationHeader";
import { PersonalBrandingSection } from "../customization/PersonalBrandingSection";
import { SocialPresenceSection } from "../customization/SocialPresenceSection";
import { HeroSection } from "../customization/HeroSection";
import { HeroCTASection } from "../customization/HeroCTASection";
import { NavbarSection } from "../customization/NavbarSection";
import { ThemeSection } from "../customization/ThemeSection";
import { FooterSection } from "../customization/FooterSection";
import { SectionLayoutSection } from "../customization/SectionLayoutSection";
import { ActiveFeaturesSection } from "../customization/ActiveFeaturesSection";
import { StickyFormFooter } from "../customization/StickyFormFooter";

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

export function CustomizationTab() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateMutation = useUpdateSiteSettings();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { register, control, handleSubmit, reset, formState: { isDirty } } = useForm<InsertSiteSettings>({
    defaultValues: settings || DEFAULT_SETTINGS,
    values: settings,
  });

  const { fields: taglineFields, append: appendTagline, remove: removeTagline } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: "heroTaglines" as any,
  });

  const { fields: navFields, append: appendNav, remove: removeNav, move: moveNav } = useFieldArray<InsertSiteSettings, "navbarLinks">({
    control,
    name: "navbarLinks",
  });

  const { fields: sectionOrderFields, move: moveSection } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const [activeSection, setActiveSection] = useState<string | null>("personal");

  const toggleSection = (id: string) => {
    setActiveSection(activeSection === id ? null : id);
  };

  const onSubmit = async (data: InsertSiteSettings) => {
    try {
      await updateMutation.mutateAsync(data);
      toast({ title: "Success", description: "Settings updated successfully" });
      reset(data);
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err instanceof Error ? err.message : "An error occurred",
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
        const parseResult = insertSiteSettingsApiSchema.safeParse(imported);

        if (!parseResult.success) {
          const errorMsg = parseResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(", ");
          throw new Error(`Invalid format: ${errorMsg}`);
        }

        reset(parseResult.data);
        toast({ title: "Import Successful", description: "Settings loaded into form. Don't forget to save!" });
      } catch (err) {
        toast({
          title: "Import Failed",
          description: err instanceof Error ? err.message : "Invalid JSON file",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      <CustomizationHeader
        onExport={handleExport}
        onImportClick={() => fileInputRef.current?.click()}
        onReset={handleReset}
      />

      <input
        type="file"
        id="import-settings"
        ref={fileInputRef}
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <PersonalBrandingSection
          register={register}
          isOpen={activeSection === "personal"}
          onToggle={() => toggleSection("personal")}
        />

        <SocialPresenceSection
          register={register}
          isOpen={activeSection === "social"}
          onToggle={() => toggleSection("social")}
        />

        <HeroSection
          register={register}
          taglineFields={taglineFields}
          appendTagline={appendTagline}
          removeTagline={removeTagline}
          isOpen={activeSection === "hero"}
          onToggle={() => toggleSection("hero")}
        />

        <HeroCTASection
          register={register}
          isOpen={activeSection === "ctas"}
          onToggle={() => toggleSection("ctas")}
        />

        <NavbarSection
          register={register}
          navFields={navFields}
          appendNav={appendNav}
          removeNav={removeNav}
          moveNav={moveNav}
          sensors={sensors}
          handleNavDragEnd={handleNavDragEnd}
          isOpen={activeSection === "navbar"}
          onToggle={() => toggleSection("navbar")}
        />

        <ThemeSection
          register={register}
          isOpen={activeSection === "appearance"}
          onToggle={() => toggleSection("appearance")}
        />

        <FooterSection
          register={register}
          isOpen={activeSection === "footer"}
          onToggle={() => toggleSection("footer")}
        />

        <SectionLayoutSection
          register={register}
          sectionOrderFields={sectionOrderFields}
          moveSection={moveSection}
          sensors={sensors}
          handleSectionDragEnd={handleSectionDragEnd}
          sectionLabels={SECTION_LABELS}
          settings={settings}
          isOpen={activeSection === "sections"}
          onToggle={() => toggleSection("sections")}
        />

        <ActiveFeaturesSection
          register={register}
          isOpen={activeSection === "features"}
          onToggle={() => toggleSection("features")}
        />

        <StickyFormFooter
          isDirty={isDirty}
          isPending={updateMutation.isPending}
        />
      </form>
    </div>
  );
}

export default CustomizationTab;
