-- Migration: Synchronize shared schema columns
-- Ensures missing columns in 'projects' and the entire 'reading_list' table exist.

-- 1. Create reading_list table if it doesn't exist
CREATE TABLE IF NOT EXISTS "reading_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"url" varchar(500) NOT NULL,
	"note" text,
	"type" varchar(50) DEFAULT 'article' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

-- 2. Ensure missing columns in projects table exist (using DO blocks for safety)
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE "projects" ADD COLUMN "summary" text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "projects" ADD COLUMN "impact" text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "projects" ADD COLUMN "role" text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "projects" ADD COLUMN "imageAlt" text;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "projects" ADD COLUMN "isFlagship" boolean DEFAULT false NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "projects" ADD COLUMN "isHidden" boolean DEFAULT false NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Skills missing columns
    BEGIN
        ALTER TABLE "skills" ADD COLUMN "mastery" integer DEFAULT 0 NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "skills" ADD COLUMN "endorsements" integer DEFAULT 0 NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Testimonials missing columns
    BEGIN
        ALTER TABLE "testimonials" ADD COLUMN "linkedinUrl" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Experiences missing columns
    BEGIN
        ALTER TABLE "experiences" ADD COLUMN "startDate" timestamp DEFAULT now() NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "experiences" ADD COLUMN "endDate" timestamp;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    -- Analytics missing columns
    BEGIN
        ALTER TABLE "analytics" ADD COLUMN "referral" varchar(255);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Guestbook missing columns
    BEGIN
        ALTER TABLE "guestbook" ADD COLUMN "reactions" jsonb DEFAULT '{}'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Articles missing columns
    BEGIN
        ALTER TABLE "articles" ADD COLUMN "reactions" jsonb DEFAULT '{}'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Site Settings missing columns
    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "availabilityStatus" varchar(255);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "aboutAvailability" varchar(255) DEFAULT 'Open to Work';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "aboutDescription" text DEFAULT 'Building scalable web systems and analyzing complex algorithms.';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "aboutTechStack" jsonb DEFAULT '["React", "Node.js", "TypeScript", "PostgreSQL", "Tailwind"]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "aboutTimeline" jsonb DEFAULT '[{"year": "2024 - Present", "title": "Advanced System Design", "description": "Deep diving into distributed systems, Docker, and Microservices architecture."}, {"year": "2023", "title": "Engineering Core", "description": "Mastering Data Structures, Algorithms, and OOP at Tribhuvan University."}, {"year": "2022", "title": "Hello World", "description": "Started the journey with Python scripting and basic web development."}]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "aboutInfoCards" jsonb DEFAULT '[{"icon": "GraduationCap", "label": "Status", "value": "B.E. Student"}, {"icon": "Code", "label": "Focus Area", "value": "Full Stack System Design", "color": "purple"}, {"icon": "Cpu", "label": "Hardware", "value": "Electronics & Comms", "color": "purple"}, {"icon": "Target", "label": "Goal", "value": "Software Engineer"}]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- ... Add other site_settings columns if needed, but start with the one reported as missing
    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "personalName" varchar(255) DEFAULT 'Your Name';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "personalTitle" varchar(255) DEFAULT 'Full Stack Developer';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "personalBio" text DEFAULT 'Passionate about building amazing products';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "resumeUrl" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "socialEmail" varchar(255);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "sectionOrder" jsonb DEFAULT '["hero", "about", "skills", "whyhireme", "services", "mindset", "projects", "practice", "experience", "guestbook", "contact", "testimonials"]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "sectionVisibility" jsonb DEFAULT '{"hero": true, "about": true, "projects": true, "skills": true, "whyhireme": true, "services": true, "mindset": true, "practice": true, "experience": true, "testimonials": true, "guestbook": true, "contact": true}'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- NEW: All other missing columns for site_settings to prevent further errors
    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "personalAvatar" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "whyHireMeData" jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "socialGithub" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "socialLinkedin" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "socialTwitter" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "socialInstagram" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "socialFacebook" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "socialYoutube" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "socialDiscord" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "socialStackoverflow" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "socialDevto" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "socialMedium" varchar(500);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "locationText" varchar(255) DEFAULT 'Kathmandu, Nepal';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "chatbotGreeting" text DEFAULT 'Hi there! I''m Abdhesh''s AI assistant. How can I help you today?';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "heroGreeting" varchar(255) DEFAULT 'Hey, I am';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "heroBadgeText" varchar(255) DEFAULT 'Available for work';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "heroTaglines" jsonb DEFAULT '["Building amazing products", "Solving complex problems"]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "heroCtaPrimary" varchar(255) DEFAULT 'View My Work';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "heroCtaPrimaryUrl" varchar(500) DEFAULT '#projects';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "heroCtaSecondary" varchar(255) DEFAULT 'Get In Touch';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "heroCtaSecondaryUrl" varchar(500) DEFAULT '#contact';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "logoText" varchar(255) DEFAULT 'Portfolio.Dev';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "heroHeadingLine1" varchar(255) DEFAULT 'Start building';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "heroHeadingLine2" varchar(255) DEFAULT 'The Future';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "navbarLinks" jsonb DEFAULT '[]'::jsonb;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "footerCopyright" varchar(255) DEFAULT '© 2024 Your Name. All rights reserved.';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "footerTagline" varchar(500) DEFAULT 'Building the future, one line of code at a time.';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "featureBlog" boolean DEFAULT true NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "featureGuestbook" boolean DEFAULT true NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "featureTestimonials" boolean DEFAULT true NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "featureServices" boolean DEFAULT true NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "featurePlayground" boolean DEFAULT false NOT NULL;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "aboutHeading" varchar(255) DEFAULT 'About Me';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "projectsHeading" varchar(255) DEFAULT 'Flagship Projects';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "skillsHeading" varchar(255) DEFAULT 'Technical Arsenal';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "whyHireMeHeading" varchar(255) DEFAULT 'Why Hire Me';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "servicesHeading" varchar(255) DEFAULT 'What I Do';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "mindsetHeading" varchar(255) DEFAULT 'Engineering Mindset';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "practiceHeading" varchar(255) DEFAULT 'Disciplined Practice';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "experienceHeading" varchar(255) DEFAULT 'Professional Journey';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "testimonialsHeading" varchar(255) DEFAULT 'Client Feedback';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "guestbookHeading" varchar(255) DEFAULT 'Guestbook';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE "site_settings" ADD COLUMN "contactHeading" varchar(255) DEFAULT 'Get In Touch';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;
