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

## 🏃 3. How to Run the Project Locally

### Running the Backend (Java / Spring Boot)
1. Open terminal and navigate to the backend folder:
   ```bash
   cd helpdesk-backend
   ```
2. Start the backend application:
   - On Windows (PowerShell/CMD):
     ```bash
     .\mvnw spring-boot:run
     ```
   - If Maven is installed globally:
     ```bash
     mvn spring-boot:run
     ```
3. Your server will start running at `http://localhost:8080`!

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
3. Start the frontend client:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:3000` to view the application!

---

## 🌿 4. Git Rules: Branches Explained Simply

Think of `main` and `dev` as the **master copies** of a building design.
- ❌ **NEVER write code directly on `main` or `dev`** (Doing this can break the working application).
- ✅ **ALWAYS create your own personal copy (called a "Branch")** to work safely.

| Branch Type | Purpose | Example Name |
| :--- | :--- | :--- |
| `feature/<name>` | Adding a new page or capability | `feature/login-screen` |
| `fix/<name>` | Fixing a bug or mistake | `fix/button-click-bug` |
| `docs/<name>` | Adding or updating documentation | `docs/update-readme` |

---

## 🔄 5. Daily Step-by-Step Workflow (How to Work & Push)

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

## 📩 6. How to Submit Your Code (Pull Request / PR)

After pushing your branch, you need to submit your code so the team lead can review and add it to `dev`.

1. Go to the project website on **[GitHub](https://github.com/HAILE-Genale/insa-helpdesk-system)**.
2. You will see a yellow banner with a button saying **"Compare & pull request"**. Click it!
3. **Base Branch:** Select `dev`.
4. **Compare Branch:** Select your branch (`feature/your-task-name`).
5. Write a simple title and brief description of what you completed.
6. Click **"Create pull request"**.
7. Notify your team lead or teammate to review and approve your work! 🎉

---

## 🚫 7. Golden Rules (Do's and Don'ts for Beginners)

### ✅ DO:
- ✅ Always pull the latest code (`git pull origin dev`) before starting your work.
- ✅ Create a new branch for every new feature or bug fix.
- ✅ Ask for help from team members whenever you get stuck!

### ❌ DON'T:
- ❌ **NEVER push directly to `main` or `dev` branches**.
- ❌ **NEVER commit passwords, API keys, or secret tokens** into your code files.
- ❌ **NEVER modify or delete other people's branches**.

---

## 📖 8. Mini Git Dictionary (Key Terms Made Easy)

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
