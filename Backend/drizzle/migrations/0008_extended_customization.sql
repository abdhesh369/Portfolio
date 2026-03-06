-- Add extended customization columns to site_settings table
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS personalName VARCHAR(255) DEFAULT 'Your Name';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS personalTitle VARCHAR(255) DEFAULT 'Full Stack Developer';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS personalBio TEXT DEFAULT 'Passionate about building amazing products';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS personalAvatar VARCHAR(500);

-- Social Links (10 platforms)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS socialGithub VARCHAR(500);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS socialLinkedin VARCHAR(500);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS socialTwitter VARCHAR(500);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS socialInstagram VARCHAR(500);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS socialFacebook VARCHAR(500);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS socialYoutube VARCHAR(500);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS socialDiscord VARCHAR(500);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS socialStackoverflow VARCHAR(500);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS socialDevto VARCHAR(500);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS socialMedium VARCHAR(500);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS socialEmail VARCHAR(255) DEFAULT 'abdheshshah111@gmail.com';

-- Hero Section
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS heroGreeting VARCHAR(255) DEFAULT 'Hey, I am';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS heroBadgeText VARCHAR(255) DEFAULT 'Available for work';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS heroTaglines JSONB DEFAULT '["Building amazing products", "Solving complex problems"]'::jsonb;

-- Hero CTAs
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS heroCtaPrimary VARCHAR(255) DEFAULT 'View My Work';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS heroCtaPrimaryUrl VARCHAR(500) DEFAULT '#projects';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS heroCtaSecondary VARCHAR(255) DEFAULT 'Get In Touch';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS heroCtaSecondaryUrl VARCHAR(500) DEFAULT '#contact';

-- Appearance & Typography
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS colorBackground VARCHAR(50) DEFAULT 'hsl(224, 71%, 4%)';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS colorSurface VARCHAR(50) DEFAULT 'hsl(224, 71%, 10%)';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS fontDisplay VARCHAR(255) DEFAULT 'Inter';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS fontBody VARCHAR(255) DEFAULT 'Inter';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS customCss TEXT;

-- Navbar Configuration
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS navbarLinks JSONB DEFAULT '[]'::jsonb;

-- Footer Configuration
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footerCopyright VARCHAR(255) DEFAULT '© 2024 Your Name. All rights reserved.';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footerTagline VARCHAR(500) DEFAULT 'Building the future, one line of code at a time.';

-- Section Ordering & Visibility
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS sectionOrder JSONB DEFAULT '["hero", "about", "projects", "skills", "testimonials", "contact"]'::jsonb;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS sectionVisibility JSONB DEFAULT '{"hero": true, "about": true, "projects": true, "skills": true, "testimonials": true, "contact": true}'::jsonb;

-- Feature Toggles
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS featureBlog BOOLEAN DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS featureGuestbook BOOLEAN DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS featureTestimonials BOOLEAN DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS featureServices BOOLEAN DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS featurePlayground BOOLEAN DEFAULT false;
