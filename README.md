# 🔰 Beginner's Guide: INSA Helpdesk System

Welcome to the **INSA Helpdesk System** repository! If you are new to Git and GitHub, **don't worry at all**! This guide is written step-by-step specifically for complete beginners.

---

## 💡 Quick Intro: What are Git & GitHub?

- **Git** is a tool installed on your computer that saves snapshots (history) of your code. Think of it like "Save Points" in a video game so you never lose your work.
- **GitHub** is a website (like Google Drive or OneDrive) where we store our project online so our team can work together safely without overwriting each other's code.

---

## 🏗️ 1. Understanding the Project Structure

This project is divided into two main parts:

```text
insa-helpdesk-system/
├── ⚙️ helpdesk-backend/    # Backend (Java / Spring Boot) — Handles database & server logic
└── 🎨 helpdesk-frontend/   # Frontend (Next.js / React)   — Handles user interface & screens
```

---

## 🛠️ 2. First-Time Setup (Do This Once)

### Step 1: Install Required Tools
Before you start, make sure you have installed these free tools on your computer:
1. **[Git](https://git-scm.com/downloads)** (Download and run the installer with default settings)
2. **[Node.js (v18+)](https://nodejs.org/)** (Required to run the Frontend)
3. **[Java JDK 17+](https://adoptium.net/)** (Required to run the Backend)
4. **[VS Code](https://code.visualstudio.com/)** (Recommended code editor)

### Step 2: Set Up Your Identity in Git
Open your terminal (or Command Prompt / Git Bash) and run these two commands (use your real name and email address associated with GitHub):

```bash
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Clone (Download) the Project to Your Computer
1. Open Terminal or VS Code Terminal.
2. Run this command to download the codebase to your computer:
   ```bash
   git clone https://github.com/HAILE-Genale/insa-helpdesk-system.git
   ```
3. Enter the project folder:
   ```bash
   cd insa-helpdesk-system
   ```

---

---

## ⚙️ 3. Environment Configuration (Read This Before Running)

This section documents the **exact configuration currently in use**. Many startup errors contributors have hit are caused by mismatched ports or missing env variables. Follow this exactly.

---

### Backend Environment — `helpdesk-backend/.env`

Create a file named `.env` inside `helpdesk-backend/` (copy from `.env.example`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=insa_helpdesk
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION=86400000
FRONTEND_BASE_URL=http://localhost:3000

# Mail (optional — uses Mailtrap sandbox by default, emails fail silently without it)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_FROM=noreply@insa-helpdesk.local
```

> ⚠️ **The `.env` file is gitignored. Never commit it.**

---

### Backend Port — `application.yml`

> **The backend runs on port `8085`, NOT `8080`.**

The `.env.example` says `SERVER_PORT=8080` — that is outdated. The actual `application.yml` now uses **8085** because 8080 was already in use on the development machine.

```yaml
server:
  port: 8085          # ← always 8085, not 8080
  servlet:
    context-path: /api
```

The full API base URL is: `http://localhost:8085/api`

---

### Frontend Environment — `helpdesk-frontend/.env.local`

Create a file named `.env.local` inside `helpdesk-frontend/`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8085/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any-random-string-here
```

> ⚠️ **`NEXT_PUBLIC_API_BASE_URL` must point to port `8085`**. Using `8080` causes "Failed to fetch" errors on every API call.  
> ⚠️ **`NEXT_PUBLIC_*` variables are baked in at build time.** If you change this file, you must **restart** `npm run dev` for it to take effect.

---

## 🏃 4. How to Run the Project Locally

### Running the Backend (Java / Spring Boot)
1. Open terminal and navigate to the backend folder:
   ```bash
   cd helpdesk-backend
   ```
2. Make sure PostgreSQL is running and the database exists:
   ```sql
   CREATE DATABASE insa_helpdesk;
   ```
3. Copy `.env.example` to `.env` and fill in your database password (see section 3 above).
4. Start the backend:
   - On Windows (PowerShell):
     ```bash
     .\mvnw.cmd spring-boot:run
     ```
   - On Mac/Linux:
     ```bash
     ./mvnw spring-boot:run
     ```
5. The server starts at **`http://localhost:8085/api`**
6. Swagger UI is available at: `http://localhost:8085/api/swagger-ui.html`

> ✅ A successful startup ends with a line like:  
> `Started HelpdeskApplication ... Tomcat started on port 8085`

---

### Running the Frontend (Next.js / React)
1. Open a **NEW terminal window** and navigate to the frontend folder:
   ```bash
   cd helpdesk-frontend
   ```
2. Install required packages (only needed the first time):
   ```bash
   npm install
   ```
3. Create `.env.local` as described in section 3 above (copy from `.env.local.example` if it exists).
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open **`http://localhost:3000`** in your browser.

> ⚠️ Always start the **backend first**, then the frontend.

---

---

## 🐛 Known Errors & Fixes (Based on Real Issues)

These are errors that have actually happened during development. If you hit one of these, the fix is documented here.

---

### ❌ "Failed to load users. Failed to fetch"
**Cause:** Frontend `.env.local` is pointing to the wrong port (`8080` instead of `8085`).  
**Fix:** Open `helpdesk-frontend/.env.local` and make sure it reads:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8085/api
```
Then **restart** `npm run dev`.

---

### ❌ "Found more than one migration with version 3" (Flyway error)
**Cause:** Duplicate Flyway migration files (e.g., two files both named `V3__...sql`).  
**Fix:** Each migration version must be unique. The project migration files are now correctly numbered V1–V16. If you add a new migration, check the highest existing version number first:
```bash
ls helpdesk-backend/src/main/resources/db/migration/
```
Name your file `V17__your_description.sql` (incrementing from the last one).

---

### ❌ "Migration VX__something.sql failed — column does not exist" (Flyway error)
**Cause:** A migration ran and failed partway. Flyway recorded it as a failed migration and refuses to retry until it is repaired.  
**Fix:** Run the Flyway repair command from the backend folder:
```bash
.\mvnw.cmd flyway:repair -Dflyway.url=jdbc:postgresql://localhost:5432/insa_helpdesk -Dflyway.user=postgres -Dflyway.password=YOUR_PASSWORD
```
Then fix the SQL in the migration file and restart the backend.

---

### ❌ "Could not resolve placeholder 'app.mail.frontend-base-url'"
**Cause:** `application-dev.yml` is missing the `app.mail` block.  
**Fix:** Make sure `helpdesk-backend/src/main/resources/application-dev.yml` contains:
```yaml
app:
  mail:
    from: ${MAIL_FROM:noreply@insa-helpdesk.local}
    frontend-base-url: ${FRONTEND_BASE_URL:http://localhost:3000}
```

---

### ❌ "Parameter 0 of constructor in SmtpEmailService required a bean of type JavaMailSender"
**Cause:** Spring Mail is not configured — the `spring.mail` block is missing from `application-dev.yml`.  
**Fix:** Add this to `helpdesk-backend/src/main/resources/application-dev.yml`:
```yaml
spring:
  mail:
    host: ${MAIL_HOST:sandbox.smtp.mailtrap.io}
    port: ${MAIL_PORT:2525}
    username: ${MAIL_USERNAME:dev}
    password: ${MAIL_PASSWORD:dev}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```
Email failures in dev are logged silently and do not crash the app once configured.

---

### ❌ "Web server failed to start. Port 8080 was already in use"
**Cause:** Another process is using port 8080.  
**Fix:** The project is already configured to use port **8085**. If you see this error, something reset `application.yml`. Check that it contains `port: 8085`:
```yaml
server:
  port: 8085
```
Or find what is using 8080 and stop it (on Windows: `netstat -ano | findstr :8080`).

---

### ❌ "could not initialize proxy [User#X] — no Session" (backend 500 error)
**Cause:** Hibernate lazy-loading tried to fetch a related entity (`reporter`, `assignee`) after the database session closed.  
**Fix:** This is already fixed in the codebase — `reporter` and `assignee` on the `Ticket` entity use `FetchType.EAGER`, and the `TicketController` is annotated with `@Transactional(readOnly = true)`. If you add new entity relationships, prefer `FetchType.EAGER` for small lookups, or ensure the method is inside a `@Transactional` boundary.

---

### ❌ "Failed to load tickets. An unexpected error occurred"
**Cause:** User's JWT token was issued before new permissions (`TICKET_VIEW`, `TICKET_MANAGE`, `TICKET_COMMENT`) were added to their role.  
**Fix:** Log out and log back in to get a fresh JWT that includes the updated permissions.

---

### ❌ Teams & Routing page redirects to landing page
**Cause:** The user's role does not have `TICKET_ASSIGN` or `TEAM_MANAGE` permissions, so `GET /teams` returns 403, which the frontend handles by clearing auth and redirecting to login.  
**Fix:** Make sure the user's role has both permissions. Run this SQL:
```sql
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'SYSTEM_ADMIN' AND p.code IN ('TEAM_MANAGE', 'TICKET_ASSIGN')
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
```
Then log out and log back in.

---

## 🌿 5. Git Rules: Branches Explained Simply

Think of `main` and `dev` as the **master copies** of a building design.
- ❌ **NEVER write code directly on `main` or `dev`** (Doing this can break the working application).
- ✅ **ALWAYS create your own personal copy (called a "Branch")** to work safely.

| Branch Type | Purpose | Example Name |
| :--- | :--- | :--- |
| `feature/<name>` | Adding a new page or capability | `feature/login-screen` |
| `fix/<name>` | Fixing a bug or mistake | `fix/button-click-bug` |
| `docs/<name>` | Adding or updating documentation | `docs/update-readme` |

---

## 🔄 6. Daily Step-by-Step Workflow (How to Work & Push)

Follow these **6 simple steps** every time you work on a task:

### Step 1: Get the Latest Code First
Before starting new work, switch to `dev` and pull the latest code downloaded by your teammates:
```bash
git checkout dev
git pull origin dev
```

### Step 2: Create Your Own Safe Branch
Create and switch to a new branch for your task:
```bash
git checkout -b feature/your-task-name
```
*(Replace `your-task-name` with what you are working on, e.g., `feature/ticket-form`)*

### Step 3: Write Your Code & Test It
Write your code in VS Code. Run the project locally to make sure everything works without errors.

### Step 4: Check & Stage Your Changes
Check which files you modified:
```bash
git status
```
Stage your changes (prepare them to be saved):
```bash
git add .
```

### Step 5: Save (Commit) Your Changes with a Message
Save a snapshot of your work with a brief message describing what you built:
```bash
git commit -m "feat: added user ticket submission form"
```

### Step 6: Upload (Push) Your Branch to GitHub
Send your branch up to GitHub online:
```bash
git push -u origin feature/your-task-name
```

---

## 📩 7. How to Submit Your Code (Pull Request / PR)

After pushing your branch, you need to submit your code so the team lead can review and add it to `dev`.

1. Go to the project website on **[GitHub](https://github.com/HAILE-Genale/insa-helpdesk-system)**.
2. You will see a yellow banner with a button saying **"Compare & pull request"**. Click it!
3. **Base Branch:** Select `dev`.
4. **Compare Branch:** Select your branch (`feature/your-task-name`).
5. Write a simple title and brief description of what you completed.
6. Click **"Create pull request"**.
7. Notify your team lead or teammate to review and approve your work! 🎉

---

## 🚫 8. Golden Rules (Do's and Don'ts for Beginners)

### ✅ DO:
- ✅ Always pull the latest code (`git pull origin dev`) before starting your work.
- ✅ Create a new branch for every new feature or bug fix.
- ✅ Ask for help from team members whenever you get stuck!

### ❌ DON'T:
- ❌ **NEVER push directly to `main` or `dev` branches**.
- ❌ **NEVER commit passwords, API keys, or secret tokens** into your code files.
- ❌ **NEVER modify or delete other people's branches**.

---

## 📖 9. Mini Git Dictionary (Key Terms Made Easy)

| Term | What it Means |
| :--- | :--- |
| **Repository (Repo)** | The complete project folder stored on GitHub. |
| **Clone** | Downloading a copy of the online project to your computer. |
| **Branch** | Your personal, isolated working area to write code safely. |
| **Commit** | A saved checkpoint/snapshot of your changes with a note. |
| **Push** | Uploading your local commits from your computer to GitHub. |
| **Pull** | Downloading new changes from GitHub to your computer. |
| **Pull Request (PR)** | Requesting team leaders to review and merge your code into `dev`. |

---

## 🆘 Need Help?
If you run into an unexpected error, git conflict, or get stuck, **don't panic!** Git is designed so that your code can always be recovered. Reach out to your team lead or post in the team group chat, and we will help you step-by-step! 🚀
