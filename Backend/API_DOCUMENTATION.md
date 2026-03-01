# Portfolio API Documentation

This document provide detailed information about the API endpoints available in the Portfolio Backend.

## 📡 Base URL
Default: `http://localhost:5000` (or `process.env.PORT`)

---

## 📂 Projects

### 1. List All Projects
- **Path**: `/api/projects`
- **Method**: `GET`
- **Description**: Retrieves all portfolio projects.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "title": "Project Title",
      "description": "Project Description",
      "techStack": ["React", "TypeScript"],
      "imageUrl": "https://example.com/image.png",
      "githubUrl": "https://github.com/...",
      "liveUrl": "https://...",
      "category": "Web Development",
      "problemStatement": "...",
      "motivation": "...",
      "systemDesign": "...",
      "challenges": "...",
      "learnings": "..."
    }
  ]
  ```

### 2. Get Project by ID
- **Path**: `/api/projects/:id`
- **Method**: `GET`
- **Description**: Retrieves a single project by its numeric ID.
- **Parameters**: `id` (numeric)

### 3. Create Project (Admin)
- **Path**: `/api/projects`
- **Method**: `POST`
- **Description**: Creates a new project.
- **Request Body**: `insertProjectApiSchema`
- **Headers**: `Authorization` required in production.

---

## 🧠 Skills

### 1. List All Skills
- **Path**: `/api/skills`
- **Method**: `GET`
- **Description**: Retrieves all technical skills. Results are cached on the server for 5 minutes.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "name": "Node.js",
      "category": "Backend",
      "icon": "Code"
    }
  ]
  ```

### 2. Create Skill (Admin)
- **Path**: `/api/skills`
- **Method**: `POST`
- **Description**: Adds a new skill to the portfolio.

---

## 💼 Experiences

### 1. List All Experiences
- **Path**: `/api/experiences`
- **Method**: `GET`
- **Description**: Retrieves professional experiences and education. Results are cached for 5 minutes.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "role": "Full Stack Developer",
      "organization": "Company Name",
      "period": "2023 - Present",
      "description": "...",
      "type": "Experience"
    }
  ]
  ```

---

## ✉️ Messages (Contact Form)

### 1. Submit a Message
- **Path**: `/api/messages`
- **Method**: `POST`
- **Description**: Submits a contact form message. Triggers an email notification if Gmail is configured.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Inquiry",
    "message": "Hello, I'm interested in your work."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Message sent successfully! We'll get back to you soon.",
    "data": { "id": 1, ... }
  }
  ```

### 2. List Messages (Admin)
- **Path**: `/api/messages`
- **Method**: `GET`
- **Description**: Retrieves all messages. Admin access required.

---

## ⚙️ Health Check

- **Endpoint**: `/health` or `/healthz`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "ok": true,
    "environment": "development",
    "timestamp": "2024-05-20T10:00:00.000Z"
  }
  ```

---

## 🤖 Chatbot API (AI Assistant)

The portfolio includes an AI-powered assistant driven by **OpenRouter** (Default: `nvidia/nemotron-nano-12b-v2-vl:free`).

### 1. Send a Message to AI
- **Path**: `/api/chat`
- **Method**: `POST`
- **Description**: Sends a message to the AI assistant. The AI has access to the portfolio's projects, skills, and experiences to provide informed answers.
- **Request Body**:
  ```json
  {
    "message": "What are your top projects?",
    "history": [
      { "role": "user", "content": "Hello" },
      { "role": "model", "content": "Hi there! How can I help you today?" }
    ]
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "text": "Based on my records, some of the top projects include [Project Name]..."
  }
  ```
- **Error Responses**:
  - **429 Too Many Requests**: Returned when the OpenRouter API limits or free tier quota is reached.
  - **500 Internal Server Error**: Returned for general AI processing failures.

---


---

## 🛡️ Validation Rules (Zod)

- **Projects**: `title` (max 255), `description` (max 5000), `imageUrl` (must be valid URL).
- **Messages**: `email` (must be valid email format), `message` (max 5000).
- **Common**: All string fields are trimmed and sanitized before insertion.
