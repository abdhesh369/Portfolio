# Portfolio Backend

A robust and scalable backend for a personal portfolio website, built with Node.js, Express, and TypeScript. It features a science-fiction minimalist HUD-style API and integrates with MySQL using Drizzle ORM.

## 🚀 Technologies

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL (via `mysql2`)
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **AI**: Google Gemini 2.0 Flash (via `@google/generative-ai`)
- **Email**: Nodemailer (Gmail integration)

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
- **AI Assistant**: Context-aware chatbot trained on portfolio data using Gemini 2.0 Flash.
- **Contact Form**: Secure message submission with automatic Gmail notifications.
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
# Database (MySQL)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=portfolio

FRONTEND_URL=http://localhost:5173
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
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
