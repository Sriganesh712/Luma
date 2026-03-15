# Luma – Intelligent AI-Powered Learning Management System

> **An enterprise-grade Learning Management System (LMS) powered by advanced AI, designed to revolutionize education by enabling personalized learning, intelligent assessment, and comprehensive student support.**

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [API Documentation](#api-documentation)
7. [System Architecture](#system-architecture)
8. [Key Capabilities](#key-capabilities)
9. [Security & Authentication](#security--authentication)
10. [Database Schema](#database-schema)
11. [Deployment](#deployment)
12. [Contributing](#contributing)
13. [License](#license)

---

## 🎯 Project Overview

**Luma** is a full-stack Learning Management System built to empower educational institutions with cutting-edge AI technology. It connects administrators, teachers, and students through an intelligent platform that delivers:

- **Personalized AI Mentoring** – Real-time academic support via an intelligent chat assistant
- **Scalable LMS Architecture** – Support for unlimited institutions, classes, and users
- **AI-Generated Assessments** – Automatically create MCQs and written assignments from course materials
- **Intelligent Grading** – Automated evaluation of student submissions with detailed feedback
- **Multi-Modal Learning** – PDF document support, video links, and various content types
- **Wellbeing & Support** – Dedicated AI mentor for emotional and psychological student support
- **Institution Management** – Multi-tenant system with role-based access control

### Target Users

- **Administrators** – Manage institutions, teachers, and institutional settings
- **Teachers** – Create classes, upload materials, set assignments, and track student progress
- **Students** – Access course materials, submit assignments, receive AI mentoring, and monitor grades

---

## ✨ Key Features

### 1. **AI-Powered Mentoring**
- Dual-mode chat system: **Study Mode** (academic help) + **Support Mode** (wellbeing)
- Powered by GPT-4o with streaming responses for real-time interaction
- Context-aware assistance based on student uploads (PDFs, course materials)
- Memory of conversation history for coherent multi-turn discussions
- Math LaTeX rendering support for scientific and technical content

### 2. **Learning Management**
- Institution setup with unique codes for multi-tenancy
- Class creation with automatic enrollment workflows
- Material upload system (PDFs, DOCX, PPTX, videos, external links)
- Persistent file storage via Supabase Cloud Storage
- Material organization by class and subject

### 3. **Assessment & Grading**
- **AI-Generated Assignments**
  - Automatic MCQ generation from course topics or uploaded materials
  - Written assignment creation with AI-defined rubrics
  - Configurable difficulty levels and question counts
- **Intelligent Grading**
  - Automatic MCQ grading with instant feedback
  - AI-powered written answer evaluation with per-question feedback
  - Grade tracking per student, per class
  - Performance summaries and analytics

### 4. **Multi-User Role System**
- **Admin Portal** – Institution management, user oversight, analytics
- **Teacher Portal** – Class management, material uploads, assignment creation, grade monitoring
- **Student Portal** – Dashboard with class overview, materials, assignments, grades, and AI chat

### 5. **Enterprise Security**
- Email/password authentication via Supabase Auth
- Role-based access control (RBAC)
- Row-Level Security (RLS) for database access
- Secure API endpoints with rate limiting
- Environment-based configuration for sensitive data

---

## 🛠️ Technology Stack

### **Frontend**
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18 | UI component library |
| **Language** | TypeScript | Type-safe development |
| **Build Tool** | Vite | Lightning-fast bundling |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Routing** | React Router v7 | Client-side navigation |
| **State Management** | Zustand | Lightweight state management |
| **UI Components** | Lucide Icons | Consistent icon system |
| **Markdown Rendering** | react-markdown | Content display |
| **Math Rendering** | KaTeX | LaTeX equation rendering |
| **Code Highlighting** | Syntax Highlighter | Source code display |
| **Animations** | Framer Motion | Smooth transitions |
| **Toast Notifications** | react-hot-toast | Non-blocking alerts |

### **Backend**
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js | JavaScript runtime |
| **Framework** | Express 5 | Web server & routing |
| **Language** | JavaScript (ES Modules) | Server logic |
| **AI Integration** | OpenAI SDK | GPT-4o API calls |
| **Hugging Face** | HF Inference SDK | Alternative AI models |
| **PDF Processing** | pdf-parse, pdfjs-dist | Document text extraction |
| **Validation** | Zod | Schema validation |
| **Middleware** | CORS, Rate Limiting | Security & scalability |

### **Database & Authentication**
| Service | Technology | Purpose |
|---------|-----------|---------|
| **Database** | PostgreSQL (via Supabase) | Relational data storage |
| **Authentication** | Supabase Auth | User identity & JWT tokens |
| **File Storage** | Supabase Storage | Document & media storage |
| **Real-time** | Supabase Realtime (optional) | Future real-time features |

### **Infrastructure**
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Containerization** | Docker | Development & deployment |
| **Orchestration** | Docker Compose | Local multi-container setup |
| **API Access** | GitHub Models API | Serverless AI inference |

---

## 📁 Project Structure

```
ai-mentor/
├── frontend/                          # React + TypeScript frontend
│   ├── src/
│   │   ├── main.tsx                   # Entry point
│   │   ├── App.jsx                    # Root component with main chat
│   │   ├── components/                # Reusable React components
│   │   │   ├── MessageBubble.tsx      # Chat message UI
│   │   │   ├── LoadingSpinner.tsx     # Loading animation
│   │   │   └── ...
│   │   ├── pages/                     # Page-level components
│   │   │   ├── Login.tsx              # Authentication page
│   │   │   ├── student/               # Student portal
│   │   │   │   ├── Dashboard.tsx      # Student home
│   │   │   │   ├── Classes.tsx        # Enrolled classes
│   │   │   │   ├── Materials.tsx      # Course materials
│   │   │   │   ├── Assignments.tsx    # Assignment list & submission
│   │   │   │   ├── Grades.tsx         # Grade tracking
│   │   │   │   └── Chat.tsx           # Full-screen AI chat
│   │   │   ├── teacher/               # Teacher portal
│   │   │   │   ├── Dashboard.tsx      # Teacher home
│   │   │   │   ├── Classes.tsx        # Managed classes
│   │   │   │   ├── CreateAssignment.tsx
│   │   │   │   └── ...
│   │   │   ├── admin/                 # Admin portal
│   │   │   │   └── Dashboard.tsx      # Institution admin
│   │   │   └── NotFound.tsx           # 404 page
│   │   ├── context/                   # React Context (auth, user)
│   │   ├── services/                  # API client functions
│   │   │   ├── api.ts                 # Axios instance
│   │   │   ├── authService.ts         # Authentication calls
│   │   │   ├── chatService.ts         # AI chat API
│   │   │   └── ...
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── utils/                     # Utility functions
│   │   ├── styles/                    # Global CSS / Tailwind config
│   │   └── App.css
│   ├── public/                        # Static assets
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Dependencies
│   ├── tsconfig.json                  # TypeScript config
│   ├── vite.config.ts                 # Vite config
│   ├── tailwind.config.ts             # Tailwind CSS config
│   └── .env.example                   # Environment template
│
├── backend/                           # Node.js + Express backend
│   ├── src/
│   │   ├── server.js                  # Application entry point
│   │   ├── app.js                     # Express app setup
│   │   ├── routes/                    # API route handlers
│   │   │   ├── authRoutes.js          # POST /api/auth/register, login
│   │   │   ├── apiRoutes.js           # GET / POST general routes
│   │   │   ├── adminRoutes.js         # Admin endpoints
│   │   │   ├── teacherRoutes.js       # Teacher endpoints
│   │   │   ├── studentRoutes.js       # Student endpoints
│   │   │   ├── materialRoutes.js      # GET /api/materials
│   │   │   ├── assignmentRoutes.js    # GET /api/assignments
│   │   │   ├── aiRoutes.js            # POST /api/ai/chat (streaming)
│   │   │   └── gradingRoutes.js       # Grading & evaluation
│   │   ├── controllers/               # Route logic layer
│   │   │   ├── authController.js      # Authentication logic
│   │   │   ├── chatController.js      # AI chat handling
│   │   │   ├── assignmentController.js
│   │   │   └── ...
│   │   ├── services/                  # Business logic
│   │   │   ├── supabaseService.js     # Database operations
│   │   │   ├── aiService.js           # OpenAI/HF integration
│   │   │   ├── pdfService.js          # PDF text extraction
│   │   │   ├── gradingService.js      # Intelligent grading
│   │   │   └── ...
│   │   ├── middleware/                # Express middleware
│   │   │   ├── authMiddleware.js      # JWT verification
│   │   │   ├── errorHandler.js        # Error handling
│   │   │   └── ...
│   │   ├── config/                    # Configuration
│   │   │   ├── constants.js           # System prompts, limits
│   │   │   ├── database.js            # Supabase client init
│   │   │   └── ...
│   │   └── utils/                     # Helper functions
│   ├── package.json                   # Dependencies
│   ├── .env.example                   # Environment template
│   └── .env                           # Actual secrets (not in git)
│
├── supabase/                          # Supabase configuration
│   ├── migrations/                    # Database migration scripts
│   └── config.toml                    # Supabase project settings
│
├── docker-compose.yml                 # Multi-container setup
├── Dockerfile                         # Backend containerization (optional)
├── .gitignore                         # Git exclusions
├── PROJECT_DETAILS.txt                # Comprehensive project documentation
├── PROGRESS.txt                       # Development progress record
└── README.md                          # This file
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have installed:
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Docker & Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** ([Sign up free](https://supabase.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/Sriganesh712/Luma.git
cd luma
```

### 2. Set Up Environment Variables

#### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:5000/api
```

#### Backend (`backend/.env`)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
OPENAI_API_KEY=your-openai-key
HF_TOKEN=your-huggingface-token
GITHUB_MODELS_TOKEN=your-github-models-token
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
```

### 3. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 4. Set Up Database

1. Create a new Supabase project at [supabase.com](https://supabase.com/)
2. Run migrations in the Supabase dashboard (SQL Editor) using scripts in `supabase/migrations/`
3. Enable Row-Level Security (RLS) on all tables
4. Set up authentication policies per the docs

### 5. Run the Application

#### Option A: Locally (separate terminals)

**Terminal 1 – Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

#### Option B: Docker Compose (single command)

```bash
docker-compose up --build
# Backend: http://localhost:5000
# Frontend: http://localhost:5173
```

### 6. Access the Application

- **Frontend:** http://localhost:5173
- **Backend Health:** http://localhost:5000/api/health
- **Login Credentials:** Use the signup form to create an institution and admin account

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require a Bearer token (JWT) in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Core Endpoints

#### **Authentication**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new institution & admin |
| POST | `/auth/login` | Login with email & password |
| POST | `/auth/logout` | Invalidate session |
| GET | `/auth/me` | Get current user profile |

#### **AI Chat** (Streaming)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat` | Send message to AI mentor (Server-Sent Events) |
| GET | `/ai/history` | Get chat conversation history |
| DELETE | `/ai/history/:conversationId` | Clear a conversation |

#### **Materials**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/materials/class/:classId` | Get materials for a class |
| POST | `/materials/upload` | Upload new material |
| DELETE | `/materials/:materialId` | Delete material |

#### **Assignments**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assignments/class/:classId` | Get assignments for a class |
| POST | `/assignments/generate` | Generate AI assignment |
| POST | `/assignments/:assignmentId/submit` | Submit assignment response |
| GET | `/assignments/:assignmentId/feedback` | Get AI grading feedback |

#### **Classes**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classes` | Get user's classes |
| POST | `/classes` | Create new class (teachers only) |
| GET | `/classes/:classId` | Get class details |
| POST | `/classes/:classId/enroll` | Enroll in class (students) |

#### **Grades**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/grades/student` | Get student's grades |
| GET | `/grades/class/:classId` | Get class grade summary (teachers) |

### Example Request: AI Chat

```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain photosynthesis",
    "conversationId": "conv_123",
    "mode": "study"
  }'
```

**Response:** Server-Sent Events (streaming)
```
data: {"type":"chunk", "content":"Photosynthesis is the process..."}
data: {"type":"chunk", "content":" by which plants convert..."}
data: {"type":"done", "tokens":150}
```

---

## 🏗️ System Architecture

### **Three-Tier Architecture**

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (Frontend)       │
│  React + TypeScript + Tailwind + Zustand   │
│  (Student, Teacher, Admin Portals)         │
└──────────────────┬──────────────────────────┘
                   │ (HTTP/REST, SSE)
┌──────────────────▼──────────────────────────┐
│        Application Layer (Backend)          │
│  Express.js + Node.js (ES Modules)         │
│  ├─ Route Handlers                         │
│  ├─ Controllers & Services                 │
│  ├─ AI Integration (OpenAI, HF)            │
│  ├─ PDF Processing                        │
│  ├─ Authentication Middleware              │
│  └─ Error Handling                         │
└──────────────────┬──────────────────────────┘
                   │ (REST API)
┌──────────────────▼──────────────────────────┐
│      Data Layer (Supabase + Storage)       │
│  ├─ PostgreSQL Database (RLS)              │
│  ├─ Supabase Auth (JWT)                    │
│  └─ Cloud File Storage (PDFs, Materials)   │
└─────────────────────────────────────────────┘
```

### **Data Flow: AI Chat**

```
1. User sends message in React component
        ↓
2. Frontend calls POST /api/ai/chat with JWT
        ↓
3. Backend verifies JWT, retrieves user context
        ↓
4. Backend loads conversation history from DB
        ↓
5. Backend prepares system prompt + user message
        ↓
6. Backend streams OpenAI GPT-4o response
        ↓
7. Frontend receives SSE chunks, displays real-time
        ↓
8. Backend saves conversation to Supabase
```

### **Assignment Generation & Grading Flow**

```
1. Teacher clicks "Generate Assignment"
        ↓
2. Frontend sends POST /api/assignments/generate
        ↓
3. Backend retrieves selected material/topic
        ↓
4. Backend calls OpenAI to create questions + rubric
        ↓
5. Assignment saved to database
        ↓
6. Students submit responses
        ↓
7. Backend evaluates with AI (MCQ auto-grade, written answers)
        ↓
8. Feedback & grades displayed to student
```

---

## 💡 Key Capabilities

### **AI Features**

#### Dual-Mode AI Mentor
- **Study Mode** – Academic assistance with LaTeX math support
- **Support Mode** – Emotional wellbeing and psychological support
- Both modes use GPT-4o for highest quality responses

#### Intelligent Assessment
- **MCQ Generation** – From topics or course materials, configurable count
- **Written Assessment** – AI creates rubrics and evaluates submissions
- **Feedback** – Per-question explanations and improvement suggestions

#### PDF & Document Support
- Extract text from PDFs automatically
- Use document context in AI responses
- Support for DOCX, PPTX, and external video links

#### Real-Time Streaming
- Server-Sent Events (SSE) for live response display
- Smooth, responsive chat experience
- Math LaTeX rendering inline

### **Scalability & Performance**

- **Multi-Tenant Architecture** – Unlimited institutions via institution codes
- **Database Optimization** – Row-Level Security for isolated data
- **Rate Limiting** – Prevent abuse and manage AI API costs
- **JWT Authentication** – Stateless, scalable auth
- **Docker & Containerization** – Easy deployment to cloud platforms

### **User Experience**

- **Responsive Design** – Mobile, tablet, desktop friendly
- **Real-Time Feedback** – Instant assignment grading, streaming responses
- **Intuitive UI** – Role-based portals tailored to each user type
- **Accessibility** – Semantic HTML, WCAG-compliant components

---

## 🔐 Security & Authentication

### Authentication Flow

```
1. User submits email & password (signup/login)
2. Backend verifies with Supabase Auth
3. Supabase returns JWT token
4. Frontend stores JWT in secure storage (HttpOnly cookie recommended)
5. All API requests include JWT in Authorization header
6. Backend middleware validates JWT using public key
7. User context (role, institution) decoded from token claims
```

### Authorization (RBAC)

| Role | Permissions |
|------|-------------|
| **Admin** | Create institutions, manage teachers, view analytics |
| **Teacher** | Create/manage classes, upload materials, create assignments, grade work |
| **Student** | View materials, submit assignments, access AI chat, view grades |

### Database Security

- **Row-Level Security (RLS)** – Users only see their own data
- **Service Role Key** – Backend uses elevated permissions for admin operations
- **Encryption at Rest** – Supabase handles encryption
- **Environment Variables** – Sensitive keys never in source code

### API Security

- **CORS** – Restricted to frontend origin
- **Rate Limiting** – Express rate-limit on sensitive endpoints
- **Input Validation** – Zod schema validation on all endpoints
- **Error Handling** – Generic error messages (no sensitive data leaks)

---

## 📊 Database Schema (Key Tables)

### `institutions`
```sql
id (UUID) – Primary key
name (TEXT) – Institution name
code (TEXT) – Unique institution code
created_at (TIMESTAMP)
```

### `users`
```sql
id (UUID) – Primary key
email (TEXT) – Unique email
role (ENUM: 'admin', 'teacher', 'student')
institution_id (UUID) – Foreign key
profile_data (JSONB) – Name, avatar, bio
created_at (TIMESTAMP)
```

### `classes`
```sql
id (UUID) – Primary key
name (TEXT) – Class name
institution_id (UUID)
teacher_id (UUID) – Foreign key to users
description (TEXT)
created_at (TIMESTAMP)
```

### `materials`
```sql
id (UUID) – Primary key
class_id (UUID)
title (TEXT)
type (ENUM: 'pdf', 'docx', 'link', 'video')
file_path (TEXT) – Path in Supabase Storage
created_at (TIMESTAMP)
```

### `assignments`
```sql
id (UUID) – Primary key
class_id (UUID)
title (TEXT)
description (TEXT)
type (ENUM: 'mcq', 'written')
due_date (TIMESTAMP)
rubric (JSONB) – AI-generated evaluation criteria
created_at (TIMESTAMP)
```

### `submissions`
```sql
id (UUID) – Primary key
assignment_id (UUID)
student_id (UUID)
response (JSONB) – Student answers
grade (DECIMAL)
feedback (JSONB) – AI feedback
submitted_at (TIMESTAMP)
```

### `conversations`
```sql
id (UUID) – Primary key
student_id (UUID)
mode (ENUM: 'study', 'support')
messages (JSONB) – Conversation history
created_at (TIMESTAMP)
```

---

## 🚢 Deployment

### **Docker Deployment**

1. **Build Images**
   ```bash
   docker-compose build
   ```

2. **Run Containers**
   ```bash
   docker-compose up -d
   ```

3. **View Logs**
   ```bash
   docker-compose logs -f
   ```

### **Cloud Deployment (Vercel + Railway)**

#### **Frontend (Vercel)**
1. Connect GitHub repo to Vercel
2. Set environment variables (Supabase keys)
3. Deploy (automatic on push to main)

#### **Backend (Railway)**
1. Create Railway app, connect GitHub
2. Set environment variables
3. Deploy with single command

#### **Database (Supabase Cloud)**
- Supabase handles everything
- Automatic backups, SSL certificates, security

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### Development Workflow

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/luma.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Frontend: Components in `src/components/`, pages in `src/pages/`
   - Backend: Routes in `src/routes/`, services in `src/services/`

4. **Test locally**
   ```bash
   # Frontend
   cd frontend && npm run dev
   
   # Backend
   cd backend && npm run dev
   ```

5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add new AI feature"
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Reference any related issues
   - Describe the changes and why

### Code Standards

- **TypeScript** – Frontend code must be type-safe
- **ESLint** – Run `npm run lint` before committing
- **Comments** – Only comment complex logic
- **Naming** – Use descriptive variable/function names

---

## 📝 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software, provided you include the original license and copyright notice.

---

## 📬 Support & Contact

- **Issues** – Report bugs on [GitHub Issues](https://github.com/yourusername/luma/issues)
- **Discussions** – Ask questions on [GitHub Discussions](https://github.com/yourusername/luma/discussions)
- **Email** – Contact: [your-email@example.com](mailto:your-email@example.com)

---

## 🌟 Acknowledgments

- **OpenAI** – GPT-4o API for intelligent mentoring
- **Supabase** – PostgreSQL database and authentication
- **React Community** – Amazing libraries and tools
- **Tailwind CSS** – Utility-first styling framework
- **All Contributors** – Thank you for making Luma better!

---

## 📈 Roadmap

### **Q2 2024**
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

### **Q3 2024**
- [ ] Integration with third-party LMS (Canvas, Blackboard)
- [ ] AI-powered learning recommendations
- [ ] Video conferencing for live classes

### **Q4 2024**
- [ ] Multilingual support
- [ ] Custom branding per institution
- [ ] Advanced plagiarism detection

---

**Built with ❤️ for educators and learners worldwide.**

