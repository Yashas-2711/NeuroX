# NeuroX — Team Collaboration & Git Workflow Guidelines

This document outlines the collaboration guidelines, Git branching strategy, code review workflow, and commit standards for the two-person development team on **NeuroX**.

---

## 🌿 Branching Strategy

The repository follows a clean, feature-branch workflow centered around a protected `main` branch.

```text
main (Production Ready Code)
│
├── feature/member-1-task  (Developer 1 Focus)
│
└── feature/member-2-task  (Developer 2 Focus)
```

---

## 🔄 Step-by-Step Collaboration Workflow

1. **Synchronize Main Branch:**
   Before starting any work, fetch and pull the latest changes from `main`:
   ```powershell
   git checkout main
   git pull origin main
   ```

2. **Create a Dedicated Feature Branch:**
   Name your branch according to the team member and feature scope:
   ```powershell
   # Format: feature/<developer>-<task-name>
   git checkout -b feature/member-1-auth-setup
   # or
   git checkout -b feature/member-2-ai-service
   ```

3. **Implement Focused Changes:**
   Keep changes confined to the scope of your assigned task. Avoid touching unrelated files.

4. **Verify Locally:**
   Run local linter, build, and check commands prior to committing:
   * **Frontend:** `npm run lint` and `npm run build` in `frontend/`
   * **Backend:** `npm run check` and `npm run build` in `backend/`
   * **AI:** Ensure Python tests or FastAPI startup succeeds.

5. **Commit with Conventional Messages:**
   Use structured commit messages (see format below).

6. **Push Feature Branch:**
   ```powershell
   git push origin feature/member-1-auth-setup
   ```

7. **Open a Pull Request (PR):**
   * Create a PR targeting `main`.
   * Add a clear summary of changes and local verification test results.

8. **Peer Code Review:**
   * The second team member reviews the PR.
   * Verify code quality, design patterns, type safety, and security.

9. **Address Feedback & Merge:**
   * Resolve any review comments on the feature branch.
   * Once approved, merge the PR into `main`.

---

## 📝 Commit Message Convention

Follow standard Conventional Commits:

* `feat:` Add a new feature (e.g., `feat: implement user registration endpoint`)
* `fix:` Fix a bug or lint error (e.g., `fix: resolve set-state-in-effect error in useIsMobile`)
* `docs:` Documentation changes (e.g., `docs: update TECH_STACK.md with audit results`)
* `refactor:` Code refactoring without changing behavior (e.g., `refactor: clean up express router structure`)
* `test:` Adding or updating tests (e.g., `test: add unit tests for jwt validation`)
* `chore:` Maintenance tasks or package updates (e.g., `chore: install sonner and recharts packages`)

---

## 🔒 Security Rules for Commits

* **NEVER commit `.env` files.**
* **NEVER commit real secrets, API keys, JWT secrets, passwords, or credentials.**
* Verify `.gitignore` is intact before executing `git add .`.
