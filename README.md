# NeuroX — Societal Innovation Collaboration Platform

**Problem Statement ID:** 26043  
**Platform Type:** Responsive Web Platform for Crowdsourcing & Societal Innovation  

---

## 📋 Overview

**NeuroX** is an open societal innovation collaboration platform designed to bridge the gap between citizens, academic institutions, industry partners, and government administrators. It empowers citizens to submit real-world societal challenges while enabling universities and industry leaders to collaborate on solutions, share research, and execute impact-driven projects.

---

## 🎯 Main Objective

To crowdsource, categorize, analyze, and solve pressing societal challenges by leveraging intelligent AI-driven problem matching, structured project collaboration, and transparent multi-stakeholder workflows.

---

## 🌟 Key Features

* **Citizen Problem Crowdsourcing:** Multi-step problem submission with media uploads, location tagging, and domain categorization.
* **AI-Powered Analysis Engine:** 
  * Problem classification via **BERT-Tiny**.
  * Semantic embedding generation (384-d) via **MiniLM**.
  * Real-time duplicate & related problem detection using cosine similarity search.
  * Automated matching of problems to relevant university research departments.
* **Multi-Stakeholder Portals:**
  * **Citizen Portal:** Submit challenges, track resolution progress, upvote issues.
  * **University Portal:** Discover matched challenges, propose research projects, assign faculty/students.
  * **Industry Portal:** Co-fund initiatives, sponsor projects, sponsor internships/R&D.
  * **Admin Dashboard:** Moderation, analytics, platform governance, verification.
* **Interactive Geographic & Analytics Dashboards:** Heatmaps, regional distribution charts, and impact metrics.

---

## 👥 User Roles

1. **Citizen:** Submits regional/societal problems, monitors progress, provides feedback.
2. **University Partner:** Explores AI-matched problems, submits R&D proposals, executes solutions.
3. **Industry Partner:** Provides funding, technical sponsorship, and commercialization pathways.
4. **Administrator:** Moderates platform content, validates user profiles, manages system metrics.

---

## 🛠️ Technology Stack

* **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Motion, Lucide React, Recharts, Leaflet / React-Leaflet.
* **Backend:** Node.js, Express, TypeScript, Mongoose ODM, MongoDB Atlas, JWT Authentication, bcryptjs, Multer, Helmet, Morgan, Express-Rate-Limit.
* **AI Microservice:** Python 3.13, FastAPI, PyTorch, HuggingFace Transformers (`BERT-Tiny`), Sentence-Transformers (`all-MiniLM-L6-v2`), Scikit-learn, NumPy, Pandas, PyMongo.
* **Tooling & Environments:** Git/GitHub, npm, pip, `.venv`.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    User Layer (Web UI)                      │
│       Citizens | Universities | Industry | Admin            │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST APIs
┌──────────────────────────────▼──────────────────────────────┐
│                    Next.js Frontend                         │
│       (App Router, Tailwind CSS, shadcn/ui, Recharts)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API Requests
┌──────────────────────────────▼──────────────────────────────┐
│                   Express Backend API                       │
│    (Auth, Middleware, Mongoose, Controllers, Routing)       │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │ Mongoose ODM                 │ HTTP REST (FastAPI)
┌──────────────▼──────────────┐  ┌────────────▼──────────────┐
│       MongoDB Atlas         │  │     AI Engine (FastAPI)    │
│  (Users, Problems, Projects)│  │ (BERT-Tiny, MiniLM 384-d) │
└─────────────────────────────┘  └────────────────────────────┘
```

---

## 🧠 AI Architecture

```text
Problem Description Input
          ↓
  BERT-Tiny Classifier (Problem Category)
          ↓
  MiniLM Sentence-Transformer (384-d Embedding)
          ↓
  Similarity Search Index (Cosine Distance)
          ↓
  Duplicate & Related Problem Detection
          ↓
  Automated University Department Matching
```

---

## 🚦 Project Status & Implementation Lifecycle

| Feature Layer | Status | Notes |
| :--- | :--- | :--- |
| Repository & Environment Setup | **Implemented** | Frontend, Backend, AI Virtual Environment configured & verified |
| Package Dependencies & Types | **Implemented** | Next.js 16, Express TypeScript, FastAPI PyTorch stack locked |
| Database Models & Schemas | **In Development** | MongoDB Mongoose models for User, Problem, Project, Solution |
| User Authentication & RBAC | **In Development** | JWT-based auth flow & role-based middleware |
| Problem Submission & Feeds | **Planned** | Frontend forms with Zod validation & Axios integration |
| AI Microservice Endpoints | **Planned** | FastAPI routes for `/classify`, `/embed`, and `/match` |
| Geo-Mapping & Analytics | **Planned** | Leaflet maps & Recharts analytics dashboards |

---

## 📁 Project Structure

```text
NeuroX — Societal Innovation Collaboration Platform/
├── frontend/             # Next.js 16 App Router UI
├── backend/              # Node.js + Express + TypeScript API
├── ai/                   # Python FastAPI + PyTorch AI Engine
├── docs/                 # Platform documentation & specs
├── .gitignore            # Git ignore specification
├── README.md             # Project overview
├── SETUP.md              # Detailed setup guide
├── TECH_STACK.md         # Technology dependency audit
├── CONTRIBUTING.md       # Collaboration & Git workflow
└── PROJECT_STRUCTURE.md  # Architectural layout reference
```

---

## ⚙️ Quick Start

### 1. Prerequisites
- Node.js `v22.x+`
- Python `3.13+`
- Git `2.48+`

### 2. Running Services

#### Frontend
```powershell
cd frontend
npm install
npm run dev
```

#### Backend
```powershell
cd backend
npm install
npm run dev
```

#### AI Engine
```powershell
cd ai
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

---

## 🔒 Security & Best Practices

- Environment secrets stored exclusively in local `.env` files (never committed).
- Template variable specs provided in `.env.example` across services.
- Rate limiting (`express-rate-limit`) and security headers (`helmet`) applied on the API layer.
- Password hashing enforced via `bcryptjs` with standard salt rounds.

---

## 📄 License & Attribution

Developed for **Problem Statement ID: 26043** — NeuroX Societal Innovation Collaboration Platform.
