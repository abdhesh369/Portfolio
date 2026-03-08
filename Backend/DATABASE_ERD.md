# Database Entity Relationship Diagram

This document provides a visual representation of the portfolio database schema.

```mermaid
erDiagram
    PROJECTS ||--o{ ANALYTICS : tracks
    PROJECTS ||--o{ CODE_REVIEWS : has
    PROJECTS ||--o{ CASE_STUDIES : generates
    
    SKILLS ||--o{ SKILL_CONNECTIONS : from
    SKILLS ||--o{ SKILL_CONNECTIONS : to
    
    ARTICLES ||--o{ ARTICLE_TAGS : has
    
    CLIENTS ||--o{ CLIENT_PROJECTS : has
    CLIENTS ||--o{ CLIENT_FEEDBACK : provides
    CLIENT_PROJECTS ||--o{ CLIENT_FEEDBACK : receives
    
    PROJECTS {
        serial id PK
        varchar title
        text description
        jsonb techStack
        varchar imageUrl
        varchar githubUrl
        varchar liveUrl
        varchar category
        integer displayOrder
        varchar status
        text problemStatement
        text motivation
        text systemDesign
        text challenges
        text learnings
        boolean isFlagship
        boolean isHidden
        text impact
        text role
        text imageAlt
        integer viewCount
    }

    SKILLS {
        serial id PK
        varchar name
        varchar category
        varchar status
        varchar icon
        text description
        text proof
        integer mastery
        real x
        real y
    }

    SKILL_CONNECTIONS {
        serial id PK
        integer fromSkillId FK
        integer toSkillId FK
    }

    EXPERIENCES {
        serial id PK
        varchar role
        varchar organization
        varchar period
        timestamp startDate
        timestamp endDate
        text description
        varchar type
    }

    MESSAGES {
        serial id PK
        varchar name
        varchar email
        varchar subject
        text message
        varchar projectType
        varchar budget
        varchar timeline
        timestamp createdAt
    }

    MINDSET {
        serial id PK
        varchar title
        text description
        varchar icon
        jsonb tags
    }

    ANALYTICS {
        serial id PK
        varchar type
        integer targetId FK
        varchar path
        varchar browser
        varchar os
        varchar device
        varchar country
        varchar city
        timestamp createdAt
    }

    GUESTBOOK {
        serial id PK
        varchar name
        text content
        varchar email
        boolean isApproved
        jsonb reactions
        timestamp createdAt
    }

    EMAIL_TEMPLATES {
        serial id PK
        varchar name
        varchar subject
        text body
        timestamp createdAt
    }

    SEO_SETTINGS {
        serial id PK
        varchar pageSlug
        varchar metaTitle
        text metaDescription
        varchar ogTitle
        text ogDescription
        varchar ogImage
        text keywords
        varchar canonicalUrl
        boolean noindex
        varchar twitterCard
        timestamp createdAt
        timestamp updatedAt
    }

    ARTICLES {
        serial id PK
        varchar title
        varchar slug
        text content
        text excerpt
        varchar featuredImage
        varchar status
        timestamp publishedAt
        integer viewCount
        integer readTimeMinutes
        varchar metaTitle
        text metaDescription
        integer authorId
        text featuredImageAlt
        timestamp createdAt
        timestamp updatedAt
    }

    ARTICLE_TAGS {
        serial id PK
        integer articleId FK
        varchar tag
    }

    SERVICES {
        serial id PK
        varchar title
        text summary
        varchar category
        jsonb tags
        integer displayOrder
        boolean isFeatured
    }

    SCOPE_REQUESTS {
        serial id PK
        varchar name
        varchar email
        text description
        varchar projectType
        jsonb features
        jsonb estimation
        varchar status
        text error
        timestamp completedAt
        timestamp createdAt
        timestamp updatedAt
    }

    CODE_REVIEWS {
        serial id PK
        integer projectId FK
        text content
        jsonb badges
        varchar status
        text error
        timestamp createdAt
    }

    CASE_STUDIES {
        serial id PK
        integer projectId FK
        varchar title
        varchar slug
        text content
        varchar status
        timestamp generatedAt
        timestamp createdAt
        timestamp updatedAt
    }

    CLIENTS {
        serial id PK
        varchar name
        varchar email
        varchar company
        varchar token
        varchar status
        timestamp createdAt
    }

    CLIENT_PROJECTS {
        serial id PK
        integer clientId FK
        varchar title
        varchar status
        timestamp deadline
        text notes
        timestamp createdAt
        timestamp updatedAt
    }

    CLIENT_FEEDBACK {
        serial id PK
        integer clientProjectId FK
        integer clientId FK
        text message
        jsonb attachments
        timestamp createdAt
    }

    SKETCHPAD_SESSIONS {
        serial id PK
        varchar title
        jsonb canvasData
        varchar status
        varchar createdBy
        timestamp createdAt
        timestamp updatedAt
    }

    TESTIMONIALS {
        serial id PK
        varchar name
        varchar role
        varchar company
        text quote
        varchar relationship
        varchar avatarUrl
        varchar linkedinUrl
        integer displayOrder
        timestamp createdAt
    }

    AUDIT_LOG {
        serial id PK
        varchar action
        varchar entity
        integer entityId
        jsonb oldValues
        jsonb newValues
        timestamp createdAt
    }

    SITE_SETTINGS {
        serial id PK
        boolean isOpenToWork
        timestamp updatedAt
        varchar personalName
        varchar personalTitle
        text personalBio
        varchar personalAvatar
        varchar socialGithub
        varchar socialLinkedin
        varchar socialTwitter
        varchar socialInstagram
        varchar socialFacebook
        varchar socialYoutube
        varchar socialDiscord
        varchar socialStackoverflow
        varchar socialDevto
        varchar socialMedium
        varchar socialEmail
        varchar heroGreeting
        varchar heroBadgeText
        jsonb heroTaglines
        varchar heroCtaPrimary
        varchar heroCtaPrimaryUrl
        varchar heroCtaSecondary
        varchar heroCtaSecondaryUrl
        varchar colorBackground
        varchar colorSurface
        varchar colorPrimary
        varchar colorSecondary
        varchar colorAccent
        varchar colorBorder
        varchar colorText
        varchar colorMuted
        fontDisplay varchar
        fontBody varchar
        text customCss
        jsonb navbarLinks
        varchar footerCopyright
        varchar footerTagline
        jsonb sectionOrder
        jsonb sectionVisibility
        jsonb availabilitySlots
        boolean featureBlog
        boolean featureGuestbook
        boolean featureTestimonials
        boolean featureServices
        boolean featurePlayground
    }
```
