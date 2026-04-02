# Database Entity Relationship Diagram (ERD)

This document describes the database schema used in the Portfolio project, managed via Drizzle ORM.

## Overview

The database uses PostgreSQL with Drizzle ORM. The schema is defined in [schema.ts](file:///d:/Portfolio/packages/shared/src/schema.ts).

## Tables

### Core Portfolio Tables

#### `projects`
Stores portfolio projects and their metadata.
- `id`: serial (PK)
- `title`: varchar(255)
- `slug`: varchar(255) (Unique)
- `description`: text
- `longDescription`: text
- `techStack`: jsonb (string[])
- `imageUrl`: varchar(500)
- `githubUrl`: varchar(500)
- `liveUrl`: varchar(500)
- `category`: varchar(100)
- `displayOrder`: integer
- `status`: varchar(50) ('In Progress', 'Completed', 'Archived')
- `problemStatement`: text
- `motivation`: text
- `systemDesign`: text
- `challenges`: text
- `learnings`: text
- `isFlagship`: boolean
- `isHidden`: boolean
- `impact`: text
- `role`: text
- `imageAlt`: text
- `viewCount`: integer
- `healthCheckUrl`: varchar(500)
- `summary`: text
- `createdAt`: timestamp
- `updatedAt`: timestamp

#### `skills`
Technical skills inventory.
- `id`: serial (PK)
- `name`: varchar(100)
- `category`: varchar(100)
- `status`: varchar(100) ('Core', 'Advanced', 'Learning')
- `icon`: varchar(100)
- `description`: text
- `proof`: text
- `mastery`: integer
- `x`: real
- `y`: real
- `endorsements`: integer

#### `skill_connections`
Many-to-many relationship mapping between skills.
- `id`: serial (PK)
- `fromSkillId`: integer (FK -> skills.id)
- `toSkillId`: integer (FK -> skills.id)

#### `experiences`
Professional and educational history.
- `id`: serial (PK)
- `role`: varchar(200)
- `organization`: varchar(200)
- `period`: varchar(100)
- `startDate`: timestamp
- `endDate`: timestamp
- `description`: text
- `type`: varchar(100) ('Experience', 'Education', etc.)

#### `services`
Offerings for clients.
- `id`: serial (PK)
- `title`: varchar(255)
- `summary`: text
- `category`: varchar(100)
- `tags`: jsonb (string[])
- `displayOrder`: integer
- `isFeatured`: boolean
- `priceMin`: integer
- `priceMax`: integer
- `ctaUrl`: varchar(500)

### Content & Communication

#### `articles`
Blog posts and write-ups.
- `id`: serial (PK)
- `title`: varchar(255)
- `slug`: varchar(255) (Unique)
- `content`: text
- `excerpt`: text
- `featuredImage`: varchar(500)
- `status`: varchar(50) ('draft', 'published', 'archived')
- `publishedAt`: timestamp
- `viewCount`: integer
- `readTimeMinutes`: integer
- `metaTitle`: varchar(255)
- `metaDescription`: text
- `authorId`: integer
- `featuredImageAlt`: text
- `reactions`: jsonb (Record<string, number>)
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `searchVector`: tsvector

#### `article_tags`
Tags associated with articles.
- `id`: serial (PK)
- `articleId`: integer (FK -> articles.id)
- `tag`: varchar(100)

#### `messages`
Contact form submissions.
- `id`: serial (PK)
- `name`: varchar(255)
- `email`: varchar(255)
- `subject`: varchar(500)
- `message`: text
- `projectType`: varchar(100)
- `budget`: varchar(100)
- `timeline`: varchar(100)
- `createdAt`: timestamp

#### `guestbook`
Visitor comments.
- `id`: serial (PK)
- `name`: varchar(255)
- `content`: text
- `email`: varchar(255)
- `isApproved`: boolean
- `reactions`: jsonb (Record<string, number>)
- `createdAt`: timestamp

#### `subscribers`
Newsletter/Update subscribers.
- `id`: serial (PK)
- `email`: varchar(255) (Unique)
- `status`: varchar(50) ('active', 'unsubscribed')
- `source`: varchar(100)
- `createdAt`: timestamp

### System & Meta

#### `site_settings`
Global configuration for the portfolio.
- `id`: serial (PK)
- `isOpenToWork`: boolean
- `availabilityStatus`: varchar(255)
- `updatedAt`: timestamp
- `personalName`: varchar(255)
- `personalTitle`: varchar(255)
- `personalBio`: text
- `personalAvatar`: varchar(500)
- `resumeUrl`: varchar(500)
- `whyHireMeData`: jsonb
- `socialGithub`: varchar(500)
- `socialLinkedin`: varchar(500)
- `socialTwitter`: varchar(500)
- `socialInstagram`: varchar(500)
- `socialFacebook`: varchar(500)
- `socialYoutube`: varchar(500)
- `socialDiscord`: varchar(500)
- `socialStackoverflow`: varchar(500)
- `socialDevto`: varchar(500)
- `socialMedium`: varchar(500)
- `socialEmail`: varchar(255)
- `personalPhone`: varchar(255)
- `locationText`: varchar(255)
- `chatbotGreeting`: text
- `heroGreeting`: varchar(255)
- `heroBadgeText`: varchar(255)
- `heroTaglines`: jsonb (string[])
- `heroCtaPrimary`: varchar(255)
- `heroCtaPrimaryUrl`: varchar(500)
- `heroCtaSecondary`: varchar(255)
- `heroCtaSecondaryUrl`: varchar(500)
- `logoText`: varchar(255)
- `navbarLinks`: jsonb
- `footerCopyright`: varchar(255)
- `footerTagline`: varchar(500)
- `sectionOrder`: jsonb (string[])
- `sectionVisibility`: jsonb (Record<string, boolean>)
- `featureBlog`: boolean
- `featureGuestbook`: boolean
- `featureTestimonials`: boolean
- `featureServices`: boolean
- `featurePlayground`: boolean

#### `audit_log`
Tracking administrative actions.
- `id`: serial (PK)
- `action`: varchar(20) ('CREATE', 'UPDATE', 'DELETE', etc.)
- `entity`: varchar(50)
- `entityId`: integer
- `oldValues`: jsonb
- `newValues`: jsonb
- `createdAt`: timestamp

### AI & Modern Features (MF)

#### `code_reviews` (MF-2)
AI-generated analysis of projects.
- `id`: serial (PK)
- `projectId`: integer (FK -> projects.id)
- `content`: text
- `badges`: jsonb (string[])
- `status`: varchar(50) ('pending', 'processing', 'completed', 'failed')
- `error`: text
- `createdAt`: timestamp

#### `case_studies` (MF-3)
AI-generated deep-dives into projects.
- `id`: serial (PK)
- `projectId`: integer (FK -> projects.id)
- `title`: varchar(255)
- `slug`: varchar(255) (Unique)
- `content`: text
- `status`: varchar(50) ('draft', 'published')
- `generatedAt`: timestamp
- `createdAt`: timestamp
- `updatedAt`: timestamp

#### `clients` (MF-4)
Client portal management.
- `id`: serial (PK)
- `name`: varchar(255)
- `email`: varchar(255) (Unique)
- `company`: varchar(255)
- `token`: varchar(255) (Unique)
- `tokenHash`: varchar(255) (Unique)
- `status`: varchar(50) ('active', 'inactive')
- `createdAt`: timestamp

#### `client_projects`
Tracking projects per client.
- `id`: serial (PK)
- `clientId`: integer (FK -> clients.id)
- `title`: varchar(255)
- `status`: varchar(50)
- `deadline`: timestamp
- `notes`: text
- `createdAt`: timestamp
- `updatedAt`: timestamp

#### `client_feedback`
Communication within the client portal.
- `id`: serial (PK)
- `clientProjectId`: integer (FK -> client_projects.id)
- `clientId`: integer (FK -> clients.id)
- `message`: text
- `isAdmin`: boolean
- `attachments`: jsonb (string[])
- `createdAt`: timestamp

#### `sketchpad_sessions` (MF-5)
Creative whiteboard tool data.
- `id`: serial (PK)
- `title`: varchar(255)
- `canvasData`: jsonb
- `status`: varchar(50) ('active', 'archived')
- `createdBy`: varchar(255)
- `createdAt`: timestamp
- `updatedAt`: timestamp

#### `chat_conversations`
History for the portfolio AI chatbot.
- `id`: serial (PK)
- `sessionId`: varchar(255)
- `messages`: jsonb ({role: string, content: string}[])
- `metadata`: jsonb
- `createdAt`: timestamp

#### `reading_list`
Curated resources and recommendations.
- `id`: serial (PK)
- `title`: varchar(255)
- `url`: varchar(500)
- `note`: text
- `type`: varchar(50) ('article', 'video', 'book', 'other')
- `createdAt`: timestamp
