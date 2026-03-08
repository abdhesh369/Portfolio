# Portfolio Backend

A robust and scalable backend for a personal portfolio website, built with Node.js, Express, and TypeScript. It features a science-fiction minimalist HUD-style API and integrates with PostgreSQL using Drizzle ORM.

## 🚀 Technologies

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Validation**: Zod
- **AI**: OpenRouter (Supports: `arcee-ai/trinity-large-preview:free`, `meta-llama/llama-4-scout:free`, `google/gemma-3-1b-it:free`)
- **Email**: Resend with BullMQ for background processing

## 📁 Project Structure

```text
├── shared/             # Shared logic between Frontend & Backend
│   ├── routes.ts       # Central API route definitions
│   └── schema.ts       # Drizzle & Zod schemas
├── src/
│   ├── routes/         # Route implementations
│   ├── create-tables.ts # Database initialization
│   ├── db.ts           # Database connection setup
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # Main API route registration
│   ├── seed.ts         # Initial database seeding
│   └── storage.ts      # Database abstraction layer
├── drizzle.config.ts   # Drizzle migration configuration
└── tsconfig.json       # TypeScript configuration
```

## ✨ Key Features

- **Project Management**: CRUD operations for portfolio projects.
- **Skills & Experiences**: Manage technical skills and professional history with caching.
- **AI Assistant**: Context-aware chatbot powered by OpenRouter with multi-model failover support.
- **Contact Form**: Secure message submission with background email delivery via Resend and BullMQ.
- **Database Migrations**: Managed via Drizzle Kit for easy schema updates.
- **Type Safety**: End-to-end type safety using shared schemas and Zod validation.

## 🛠️ Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 1. Clone & Install

```bash
cd Backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
# Database (PostgreSQL)
DATABASE_URL=postgres://user:password@host:port/database

# Redis (Required for Caching & Queues)
REDIS_URL=redis://localhost:6379

FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=re_...
CONTACT_EMAIL=your-email@example.com
OPENROUTER_API_KEY=sk-or-...
```

### 3. Database Initialization

```bash
# Generate migrations
npm run generate

# Apply migrations
npm run migrate
```

### 4. Running the Project

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 🔌 API Reference

Full documentation can be found in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Main Endpoints:
- `GET /api/projects`: List all projects.
- `GET /api/skills`: List all skills.
- `GET /api/experiences`: List all experiences.
- `POST /api/messages`: Submit a new message.

## 📄 License

This project is private and for personal use.
