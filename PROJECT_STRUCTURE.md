# NeuroX — Project Structure & Architectural Layout

This document explains the organization of directories, file responsibilities, and data flows within the **NeuroX** platform workspace.

---

## 📁 Repository Overview

```text
NeuroX — Societal Innovation Collaboration Platform/
├── frontend/             # Next.js 16 Web Application (App Router)
├── backend/              # Node.js + Express + TypeScript Core API
├── ai/                   # Python FastAPI AI Microservice Engine
├── docs/                 # Architecture Specs, API Specs & Workflow Documentation
├── .gitignore            # Root Git Ignore rules
├── README.md             # Project Overview & Quick Start
├── SETUP.md              # Installation & Verification Manual
├── TECH_STACK.md         # Technology & Dependency Matrix
├── CONTRIBUTING.md       # Collaboration & Git Branching Strategy
└── PROJECT_STRUCTURE.md  # Architectural layout reference (this file)
```

---

## 🏛️ Directory Responsibilities

### 1. `frontend/` — Client Application Layer
Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and shadcn/ui.
* **`app/`**: Next.js App Router pages, layouts, and route handlers.
* **`components/`**: Modular UI components.
  * `ui/`: Standard shadcn/ui accessible components (button, card, dialog, table, sidebar, etc.).
* **`hooks/`**: Custom React hooks (e.g., `use-mobile`, theme hooks).
* **`lib/`**: Utility functions (`utils.ts`), API client instances, helper functions.
* **`public/`**: Static assets, public graphics, icons.

### 2. `backend/` — Core REST API Layer
Built with Node.js, Express, TypeScript, and Mongoose ODM for MongoDB Atlas.
* **`src/config/`**: Database connections, environment setup, passport/JWT configs.
* **`src/models/`**: Mongoose schemas (User, Problem, Project, Solution, University, Analytics).
* **`src/controllers/`**: API endpoint handlers for business logic.
* **`src/routes/`**: Express routing modules grouped by resource.
* **`src/middleware/`**: Authentication, RBAC, error handling, rate limiting.
* **`src/services/`**: Business logic encapsulation, external API adapters.
* **`src/validators/`**: Zod request payload validation schemas.
* **`src/utils/`**: Helper utilities, token generators, formatters.
* **`src/ai/`**: Integration client for communicating with the AI microservice.

### 3. `ai/` — Intelligent Matching & Processing Engine
Built with Python 3.13, FastAPI, PyTorch, HuggingFace Transformers, and Sentence-Transformers.
* **`.venv/`**: Isolated Python virtual environment containing dependencies.
* **`requirements.txt`**: Locked list of Python packages.
* **`main.py`** *(Planned)*: FastAPI entry point serving model endpoints.
* **`models/`** *(Planned)*: Local model cache for BERT-Tiny and MiniLM weights.

### 4. `docs/` — Specifications & Architecture
Contains design documents, problem statement background, system flowcharts, and documentation assets.

---

## 🔄 End-to-End System Data Flow

```text
  ┌──────────┐     ┌────────────┐     ┌──────────┐     ┌──────────┐
  │ Citizen  │     │ University │     │ Industry │     │  Admin   │
  └────┬─────┘     └─────┬──────┘     └────┬─────┘     └────┬─────┘
       │                 │                 │                │
       └─────────────────┴────────┬────────┴────────────────┘
                                  │ Interacts with UI
                                  ▼
                     ┌────────────────────────┐
                     │    Next.js Frontend    │
                     └───────────┬────────────┘
                                 │ HTTP REST (JSON)
                                 ▼
                     ┌────────────────────────┐
                     │   Express Backend API  │
                     └─────┬────────────┬─────┘
                           │            │
             Mongoose ODM  │            │ HTTP REST (FastAPI)
                           ▼            ▼
                     ┌──────────┐  ┌──────────┐
                     │ MongoDB  │  │ AI Engine│
                     └──────────┘  └────┬─────┘
                                        │
                                        ▼
                           ┌──────────────────────────┐
                           │ Problem Classification   │
                           │ 384-d Embedding Vector   │
                           │ Cosine Similarity Search │
                           │ University Matching      │
                           └────────────┬─────────────┘
                                        │
                                        ▼
                           ┌──────────────────────────┐
                           │    Project Workflow &    │
                           │    Impact Analytics      │
                           └──────────────────────────┘
```
