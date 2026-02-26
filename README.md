# Portfolio Backend

A robust and scalable backend for a personal portfolio website, built with Node.js, Express, and TypeScript. It features a science-fiction minimalist HUD-style API and integrates with MySQL using Drizzle ORM.

## 🚀 Technologies

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL (via `mysql2`)
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Email**: Nodemailer (Gmail integration)
- **Deployment**: Support for standard Node.js environments

## 📁 Project Structure

```text
├── shared/             # Shared logic between Frontend & Backend
│   ├── routes.ts       # Central API route definitions
│   └── schema.ts       # Drizzle & Zod schemas
├── src/
│   ├── routes/         # Route implementations (if split)
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
- **Contact Form**: Secure message submission with automatic Gmail notifications.
- **Database Migrations**: Managed via Drizzle Kit for easy schema updates.
- **Type Safety**: End-to-end type safety using shared schemas and Zod validation.
- **Graceful Shutdown**: Properly handles process signals to close connections.

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










# Cyberpunk Portfolio - Interactive Sci-Fi Experience

A high-end, premium interactive portfolio website featuring a futuristic sci-fi/cyberpunk aesthetic. Built with React 19, Vite, and Framer Motion for a state-of-the-art immersive experience.

![Portfolio Preview]()

## 🌌 Overview

This project is not just a portfolio, but a digital experience. It uses advanced CSS techniques, complex animations, and a curated design system to deliver a "wow" factor. The interface mimics a high-tech HUD (Heads-Up Display) with glowing elements, interactive modules, and smooth transitions.

## 🚀 Built With

### Core
- **React 19**: Modern UI library for building component-based interfaces.
- **Vite**: Ultra-fast build tool and development server.
- **TypeScript**: Type-safe development for robust application logic.

### Styling & Animation
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Framer Motion**: Powerful animation library for fluid, high-performance transitions.
- **Lucide React**: Clean and consistent iconography.
- **Typewriter Effect**: Dynamic text animations for that hacking/terminal feel.

### UI Components
- **Radix UI**: Unstyled, accessible UI primitives (Dialog, Dropdown, Popover, Select, Tabs, Toast).
- **Class Variance Authority (CVA)**: Manageable component variants.

## ✨ Key Features

- **Dynamic HUD Sections**:
  - **Hero**: Immersive entrance with glitch effects and typing animations.
  - **About**: Interactive profile card with 3D tilt effects.
  - **Skills**: Visualized tech stack with progress bars and glowing highlights.
  - **Projects**: Detailed project showcase with deep-dive technical breakdowns.
  - **Experience**: Chronological professional timeline with cyberpunk styling.
  - **Engineering Mindset**: Showcasing problem-solving approaches.
- **Interactive UI**:
  - **Floating Particles**: Background depth and movement.
  - **Custom Cursor/Interactive Elements**: Enhancing the "alive" feel of the UI.
  - **Theme System**: Cohesive color palette and premium typography.
- **Mobile Responsive**: Optimized for all devices while maintaining the sci-fi aesthetic.

## 🛠️ Project Structure

```text
src/
├── components/     # UI Components (Hero, About, Projects, etc.)
│   └── ui/         # Base UI building blocks (Radix-based)
├── pages/          # Main page layouts (Home, ProjectDetail)
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and configurations
├── shared/         # Shared schemas and constants
└── index.css       # Global styles and design system tokens
```

## 🚥 Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Designed and Developed by [Abdhesh Sah](mailto:abdheshshah111@gmail.com)
