# NeuroX — Environment Setup & Installation Guide

This document provides complete, step-by-step instructions for setting up, configuring, verifying, and running the **NeuroX** platform environment on Windows PowerShell.

---

## 💻 1. Prerequisites Check

Before starting, verify that your machine has the following tools installed:

```powershell
node --version       # Expected: v20.x or higher (v22.x recommended)
npm --version        # Expected: 10.x or higher
git --version        # Expected: 2.x or higher
python --version     # Expected: Python 3.10+ (3.13 recommended)
pip --version        # Expected: pip 24.x or higher
```

---

## 🚀 2. Frontend Setup (Next.js 16)

Navigate to the `frontend/` folder:

```powershell
cd frontend
```

### Install Dependencies
```powershell
npm install
```

### Configure Environment Variables
Copy `.env.example` to `.env.local`:
```powershell
Copy-Item .env.example .env.local
```

### Verification & Build Commands
```powershell
# Run Linter
npm run lint

# Compile Production Build
npm run build

# Start Development Server
npm run dev
```
The frontend web application will run at: `http://localhost:3000`

---

## ⚙️ 3. Backend Setup (Node.js + Express + TypeScript)

Navigate to the `backend/` folder:

```powershell
cd ..\backend
```

### Install Dependencies
```powershell
npm install
```

### Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

### Verification & Build Commands
```powershell
# Run TypeScript Check
npm run check

# Compile TypeScript to JavaScript
npm run build

# Start Development Server with Auto-Reload
npm run dev
```
The backend API server will run at: `http://localhost:5000`

---

## 🧠 4. AI Service Setup (Python + PyTorch + FastAPI)

Navigate to the `ai/` folder:

```powershell
cd ..\ai
```

### Create & Activate Virtual Environment
```powershell
# Create .venv if not present
python -m venv .venv

# Activate Virtual Environment (PowerShell)
.\.venv\Scripts\Activate.ps1
```

### Install AI Dependencies
```powershell
pip install -r requirements.txt
```

### Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

### Verification & Run Commands
```powershell
# Verify Python version inside environment
python --version

# List installed packages
pip list

# Launch FastAPI Microservice
uvicorn main:app --reload --port 8000
```
The AI microservice will run at: `http://localhost:8000`

---

## 🔍 5. Verification Checklist

Run these commands to verify the entire platform stack before beginning feature implementation:

| Service | Command | Target Working Directory | Expected Result |
| :--- | :--- | :--- | :--- |
| **Frontend** | `npm run lint` | `frontend/` | Exits with code 0 (No errors) |
| **Frontend** | `npm run build` | `frontend/` | Static page generation complete |
| **Backend** | `npm run check` | `backend/` | TypeScript type-check passed |
| **Backend** | `npm run build` | `backend/` | Transpiles into `backend/dist/` |
| **AI Engine** | `python --version` | `ai/` (`.venv`) | Python 3.13.x inside virtual environment |
| **Secrets** | Automated scan | Root workspace | Zero committed credentials/secrets |
