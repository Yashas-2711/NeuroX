# NeuroX — Tech Stack & Dependency Audit Document

This document provides a comprehensive audit of all verified technology layers, runtime frameworks, packages, and exact installed versions within the **NeuroX** workspace.

---

## 📊 Dependency Matrix

| Layer | Technology / Package | Purpose | Status | Installed Version |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Next.js | Web Framework (App Router) | Verified | `16.3.5` |
| **Frontend** | React | UI Library | Verified | `19.2.8` |
| **Frontend** | React DOM | DOM Renderer | Verified | `19.2.8` |
| **Frontend** | TypeScript | Type Safety | Verified | `^5.9.3` |
| **UI & Styling** | Tailwind CSS | Utility-first CSS Engine | Verified | `^4.0.9` |
| **UI & Styling** | shadcn/ui | Accessible Component Primitives | Verified | `^4.21.0` |
| **UI & Styling** | next-themes | Theme Switching (Light/Dark) | Verified | `^0.4.6` |
| **Animation** | Motion | UI Animations & Transitions | Verified | `^13.4.0` |
| **Icons** | Lucide React | Icon System | Verified | `^1.46.0` |
| **Forms** | React Hook Form | Form State & Validation | Verified | `^7.88.0` |
| **Validation** | Zod | Schema Validation | Verified | `^4.6.5` |
| **Validation** | @hookform/resolvers | Bridge for React Hook Form + Zod | Verified | `^5.9.1` |
| **HTTP Client** | Axios | REST API Requests | Verified | `^1.20.0` |
| **Notifications**| Sonner | Toast Notifications | Verified | `^2.0.8` |
| **Analytics** | Recharts | Data Visualization & Charts | Verified | `^3.10.1` |
| **Maps & Geo** | Leaflet | Map Engine | Verified | `^1.9.4` |
| **Maps & Geo** | React Leaflet | React Components for Leaflet | Verified | `^5.0.0` |
| **Backend** | Node.js | Server Runtime | Verified | `v22.23.1` |
| **Backend** | Express | HTTP API Framework | Verified | `^5.2.1` |
| **Backend** | TypeScript | Server Type Safety | Verified | `^7.0.2` |
| **Backend** | tsx | TypeScript Execution & Watcher | Verified | `^4.23.13` |
| **Database** | MongoDB / Mongoose | Database & ODM Layer | Verified | `^9.10.1` |
| **Auth & Security**| JSON Web Token (jwt)| Session & Token Authentication | Verified | `^9.0.3` |
| **Auth & Security**| bcryptjs | Password Hashing | Verified | `^3.0.3` |
| **Auth & Security**| Helmet | HTTP Security Headers | Verified | `^8.3.0` |
| **Auth & Security**| Express-Rate-Limit | Rate Limiting Middleware | Verified | `^8.7.0` |
| **File Handling**| Multer | Multipart Form Data / Uploads | Verified | `^2.4.0` |
| **Logging** | Morgan | HTTP Request Logger | Verified | `^1.12.1` |
| **AI Engine** | Python | AI Microservice Runtime | Verified | `3.13.15` |
| **AI Engine** | PyTorch (`torch`) | Neural Network Framework | Verified | `2.14.0` |
| **AI Engine** | Transformers | HuggingFace BERT-Tiny Model | Verified | `5.17.0` |
| **AI Engine** | Sentence-Transformers | MiniLM 384-d Embedding Engine | Verified | `6.0.1` |
| **AI Engine** | Scikit-learn | Cosine Similarity & Clustering | Verified | `1.9.1` |
| **AI Engine** | NumPy | Matrix & Vector Math | Verified | `2.5.3` |
| **AI Engine** | Pandas | Data Processing & Structuring | Verified | `3.0.5` |
| **AI API** | FastAPI | High-performance AI REST Service| Verified | `0.141.1` |
| **AI Server** | Uvicorn | ASGI Server Runtime | Verified | `0.53.0` |
| **AI Validation** | Pydantic | AI Data Schema Validation | Verified | `2.13.5` |
| **AI Database** | PyMongo | Direct MongoDB Python Adapter | Verified | `4.18.1` |
| **AI Config** | python-dotenv | Environment Variables Loader | Verified | `1.2.3` |
| **AI Processing** | Pillow | Image Pre-processing Engine | Verified | `12.3.0` |

---

## 🛠️ Build & Verification Toolchain

- **Frontend Builder:** Next.js Compiler with Turbopack (`next build`)
- **Frontend Linter:** ESLint 9 (`eslint`)
- **Backend Compiler:** TypeScript Compiler (`tsc`) & Type-checker (`tsc --noEmit`)
- **AI Environment:** Isolated Python Virtual Environment (`.venv`)
