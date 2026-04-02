import React from "react";
import { UseFormRegister } from "react-hook-form";
import { Heading2 } from "lucide-react";
import type { InsertSiteSettings } from "#shared";
import { CollapsibleSection } from "./SectionsCommon";
import { FloatingLabelInput } from "../AdminShared";

interface SectionHeadingsSectionProps {
  register: UseFormRegister<InsertSiteSettings>;
  isOpen: boolean;
  onToggle: () => void;
}

export function SectionHeadingsSection({ register, isOpen, onToggle }: SectionHeadingsSectionProps) {
  return (
    <CollapsibleSection
      title="SECTION_HEADINGS_V1"
      description="Manage the title overrides for all portfolio sections."
      icon={<Heading2 size={20} />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 p-2">
        <FloatingLabelInput
          label="About Me Heading"
          placeholder="About Me"
          {...register("aboutHeading")}
        />

        <FloatingLabelInput
          label="Projects Heading"
          placeholder="Featured Projects"
          {...register("projectsHeading")}
        />

        <FloatingLabelInput
          label="Skills Heading"
          placeholder="Technical Arsenal"
          {...register("skillsHeading")}
        />

        <FloatingLabelInput
          label="Why Hire Me Heading"
          placeholder="Why Hire Me"
          {...register("whyHireMeHeading")}
        />

        <FloatingLabelInput
          label="Services Heading"
          placeholder="What I Do"
          {...register("servicesHeading")}
        />

        <FloatingLabelInput
          label="Mindset Heading"
          placeholder="Engineering Mindset"
          {...register("mindsetHeading")}
        />

        <FloatingLabelInput
          label="Practice Heading"
          placeholder="Disciplined Practice"
          {...register("practiceHeading")}
        />

        <FloatingLabelInput
          label="Experience Heading"
          placeholder="Professional Journey"
          {...register("experienceHeading")}
        />

        <FloatingLabelInput
          label="Testimonials Heading"
          placeholder="Client Feedback"
          {...register("testimonialsHeading")}
        />

        <FloatingLabelInput
          label="Guestbook Heading"
          placeholder="Guestbook"
          {...register("guestbookHeading")}
        />

        <FloatingLabelInput
          label="Contact Heading"
          placeholder="Get In Touch"
          {...register("contactHeading")}
        />

        <FloatingLabelInput
          label="Blog Heading"
          placeholder="Latest Articles"
          {...register("blogHeading")}
        />
      </div>
    </CollapsibleSection>
  );
}
