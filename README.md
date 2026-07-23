# 🎧 INSA Helpdesk System — Collaborator Guidelines & Workflow

Welcome to the **INSA Helpdesk System** repository! This document serves as the official guide for all team members and collaborators. Please read these guidelines carefully before contributing.

---

## 📌 1. Project Overview & Architecture

The repository is structured as a monorepo containing two main projects:

```
insa-helpdesk-system/
├── helpdesk-backend/     # Spring Boot (Java) REST API service
├── helpdesk-frontend/    # Next.js / React (JavaScript + Tailwind CSS) client app
├── .gitignore            # Root git ignore file
└── README.md             # Collaborator guide & documentation
```

---

## 🌿 2. Branching Strategy

To keep the repository clean and stable, we follow a feature-branch workflow:

| Branch Name | Purpose | Direct Push Allowed? |
| :--- | :--- | :---: |
| `main` | Production release-ready code | ❌ **NO** |
| `dev` | Integration & testing branch | ❌ **NO** (Merge via PR) |
| `feature/<name>` | Developing a new feature (e.g., `feature/ticket-management`) | ✅ **YES** (Push to your branch) |
| `fix/<name>` | Fixing a bug (e.g., `fix/auth-cors-issue`) | ✅ **YES** (Push to your branch) |
| `refactor/<name>`| Code cleanup/refactoring (e.g., `refactor/user-service`) | ✅ **YES** (Push to your branch) |
| `docs/<name>` | Documentation updates (e.g., `docs/update-readme`) | ✅ **YES** (Push to your branch) |

> ⚠️ **CRITICAL RULE**: **NEVER push code directly to `main` or `dev`**. All changes must be pushed to a feature/fix branch and merged via a **Pull Request (PR)**.

---

## 📤 3. Step-by-Step Guide: How to Work and Push

### Step 1: Clone & Get the Latest Code
Before starting any work, switch to `dev` (or `main`) and pull the latest changes:
```bash
git checkout dev
git pull origin dev
```

### Step 2: Create a New Feature or Bugfix Branch
Always work on a separate branch named appropriately:
```bash
# For a feature:
git checkout -b feature/ticket-creation

# For a bug fix:
git checkout -b fix/login-validation
```

### Step 3: Develop & Test Locally
Make your changes and verify that your code works locally:
- **Backend:** Test your Spring Boot endpoints.
- **Frontend:** Test Next.js pages and component interactions.

### Step 4: Check Git Status & Stage Changes
```bash
# Check modified and new files
git status

# Add specific files (avoid using `git add .` blindly!)
git add helpdesk-frontend/src/components/TicketForm.jsx
```

### Step 5: Commit with Clear Messages
Write meaningful commit messages (see [Commit Guidelines](#-6-commit-message-guidelines)):
```bash
git commit -m "feat(frontend): add ticket creation form component"
```

### Step 6: Push Your Branch to GitHub
Push your working branch to the remote repository:
```bash
git push -u origin feature/ticket-creation
```

### Step 7: Create a Pull Request (PR)
1. Go to the repository on GitHub.
2. Click **New Pull Request**.
3. Select **Target Branch**: `dev` (or `main` if `dev` is not created yet).
4. Select **Source Branch**: `feature/ticket-creation`.
5. Add a concise title and description explaining what was changed.
6. Request at least **1 team member** to review your PR.
7. Merge only after approval and test checks pass.

---

## ✅ 4. What Collaborators SHOULD Do (DO's)

- ✅ **DO pull latest changes** regularly from the target branch before making commits to avoid merge conflicts.
- ✅ **DO follow naming conventions** for branches (`feature/...`, `fix/...`, `docs/...`).
- ✅ **DO test your code** (both backend and frontend) locally before pushing.
- ✅ **DO keep Pull Requests small and focused** on a single feature or bug fix.
- ✅ **DO write descriptive commit messages** that explain *what* and *why*.
- ✅ **DO create/update documentation** if you add new APIs or configuration settings.
- ✅ **DO keep secrets safe**: Store API keys, passwords, and tokens in `.env.local` or environment variables—never in tracked git files.

---

## ❌ 5. What Collaborators SHOULD NOT Do (DON'Ts)

- ❌ **DO NOT push directly to `main` or `dev` branches**.
- ❌ **DO NOT commit sensitive information** (passwords, JWT secrets, database URIs, API keys).
- ❌ **DO NOT commit generated files or dependencies**:
  - `node_modules/`
  - `target/`
  - `.next/`
  - `.env` / `.env.local`
  - IDE settings (`.vscode/`, `.idea/`)
- ❌ **DO NOT merge your own Pull Request** without team review or approval.
- ❌ **DO NOT force push (`git push --force` or `git push -f`)** to shared branches (`main` or `dev`).
- ❌ **DO NOT make massive commits** combining unrelated features (e.g. changing frontend styling and backend database models in one giant commit).

---

## 💬 6. Commit Message Guidelines

We follow **Conventional Commits**. Please format your commit messages like this:

`<type>(<scope>): <short summary>`

### Allowed Types:
- `feat`: A new feature (e.g., `feat(backend): add authentication controller`)
- `fix`: A bug fix (e.g., `fix(frontend): resolve button alignment issue`)
- `docs`: Documentation changes (e.g., `docs(readme): add collaborator workflow`)
- `style`: Formatting, missing semi-colons, no code logic change (e.g., `style(frontend): format JSX code`)
- `refactor`: Restructuring code without changing functionality (e.g., `refactor(backend): optimize user service query`)
- `test`: Adding or updating tests (e.g., `test(backend): add unit tests for ticket service`)
- `chore`: Maintenance tasks, dependency updates (e.g., `chore: update pom.xml dependencies`)

---

## 🚀 7. Local Setup Quickstart

### Backend Setup (`helpdesk-backend`)
- **Prerequisites:** Java 17+, Maven 3.8+
- **Run Locally:**
  ```bash
  cd helpdesk-backend
  mvn spring-boot:run
  ```
  *(Runs by default on `http://localhost:8080`)*

### Frontend Setup (`helpdesk-frontend`)
- **Prerequisites:** Node.js 18+ & npm
- **Run Locally:**
  ```bash
  cd helpdesk-frontend
  npm install
  npm run dev
  ```
  *(Runs by default on `http://localhost:3000`)*

---

## 🤝 Need Help?
If you run into issues with git, merge conflicts, or local setup, post a message in the team chat or contact the project maintainer before making drastic git resets!
