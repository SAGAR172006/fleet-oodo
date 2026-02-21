# 🚛 FleetFlow — Modular Fleet & Logistics Management System

A full-stack, modular fleet and logistics management web application built with **React**, **Node.js/Express**, and **Firebase (Firestore)**. FleetFlow provides role-based dashboards for fleet managers, dispatchers, safety officers, and finance analysts to manage vehicles, trips, maintenance, expenses, driver performance, and analytics — all in real-time.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started — Run Locally](#-getting-started--run-locally)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Backend Setup](#3-backend-setup)
  - [4. Firebase Configuration](#4-firebase-configuration)
  - [5. Start the Application](#5-start-the-application)
- [Environment Variables](#-environment-variables)
- [Troubleshooting — Common npm Errors & Version Conflicts](#-troubleshooting--common-npm-errors--version-conflicts)
- [User Roles & Access](#-user-roles--access)
- [API Endpoints](#-api-endpoints)
- [License](#-license)

---

## ✨ Features

| Module             | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **Dashboard**      | Real-time overview of trips, maintenance alerts, and summary KPIs           |
| **Vehicle Registry** | CRUD for fleet vehicles (ID, make, model, year, status, assigned driver)  |
| **Trip Dispatcher** | Create, edit, and track trips with status lifecycle (on trip → completed/aborted) |
| **Maintenance**    | Schedule and track maintenance records (Scheduled, Emergency, Routine)      |
| **Trip & Expense** | Log expenses per trip with categories (Fuel, Toll, Driver Pay, etc.)       |
| **Performance**    | Driver management with safety scores and license compliance tracking        |
| **Analytics**      | Fleet-wide KPIs, trip status breakdowns, and monthly expense charts         |
| **Auth**           | Role-based registration/login with business key validation and bcrypt hashing |

---

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite 5
- **React Router DOM v6** — client-side routing
- **Tailwind CSS v3** — utility-first styling
- **Firebase SDK v10** — Firestore real-time listeners (client-side)
- **Axios** — HTTP client for backend API calls

### Backend
- **Node.js** with **Express v4**
- **Firebase Admin SDK v11** — server-side Firestore access
- **bcrypt** — password hashing
- **dotenv** — environment variable management
- **cors** — cross-origin resource sharing
- **nodemon** — development auto-restart

---

## 📁 Project Structure

```
fleet-oodo/
├── backend/
│   ├── routes/
│   │   ├── auth.js              # Register, login, business key validation
│   │   └── users.js             # User ID availability check
│   ├── firebase-admin.js        # Firebase Admin SDK initialization
│   ├── business-keys.json       # Valid business keys for registration
│   ├── server.js                # Express server entry point
│   ├── package.json
│   └── .gitignore
├── src/
│   ├── components/
│   │   ├── AppShell.jsx         # Layout wrapper (Navbar + Sidebar)
│   │   ├── Navbar.jsx           # Top navigation bar
│   │   ├── Sidebar.jsx          # Slide-out navigation drawer
│   │   └── ProtectedRoute.jsx   # Role-based route guard
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state management (React Context)
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── VehicleRegistry.jsx
│   │   ├── TripDispatcher.jsx
│   │   ├── Maintenance.jsx
│   │   ├── TripAndExpense.jsx
│   │   ├── Performance.jsx
│   │   └── Analytics.jsx
│   ├── firebase.js              # Firebase client SDK config
│   ├── index.css                # Tailwind directives + custom styles
│   ├── main.jsx                 # React entry point
│   └── App.jsx                  # Root component with route definitions
├── index.html                   # Vite HTML entry
├── vite.config.js               # Vite config (proxy /api → backend)
├── tailwind.config.js
├── postcss.config.js
├── package.json                 # Frontend dependencies
└── .gitignore
```

---

## ✅ Prerequisites

Before you begin, make sure you have the following installed:

| Tool       | Minimum Version | Check Command       |
|------------|-----------------|---------------------|
| **Node.js** | v18.x or later  | `node --version`   |
| **npm**     | v9.x or later   | `npm --version`    |
| **Git**     | Any recent      | `git --version`    |

> **⚠️ Node.js v18+ is strongly recommended.** The `bcrypt` native module and Vite 5 require Node ≥ 18. Using Node 16 or below will cause build failures.

You will also need:
- A **Firebase project** with Firestore enabled
- A **Firebase service account key** (JSON) for the backend

---

## 🚀 Getting Started — Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/SAGAR172006/fleet-oodo.git
cd fleet-oodo
```

---

### 2. Frontend Setup

```bash
# Install frontend dependencies
npm install
```

If `npm install` completes without errors, skip to [Backend Setup](#3-backend-setup).

**If you encounter peer dependency or version conflict errors**, see the [Troubleshooting](#-troubleshooting--common-npm-errors--version-conflicts) section below.

---

### 3. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install backend dependencies
npm install

# Return to root
cd ..
```

> **Note:** The `bcrypt` package requires native compilation. If you run into build errors, see [Troubleshooting](#2-bcrypt-native-module-build-failure).

---

### 4. Firebase Configuration

#### Frontend — `src/firebase.js`

The file already contains Firebase config values. If you are using your own Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/) → your project → **Project Settings** → **Your Apps** (Web app).
2. Copy the Firebase config object.
3. Replace the values in `src/firebase.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

#### Backend — Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/) → your project → **Project Settings** → **Service Accounts**.
2. Click **Generate New Private Key** and download the JSON file.
3. Rename it to `fleet-33608-f60c8e3dd340.json` (or update the path in `backend/firebase-admin.js`) and place it in the `backend/` folder.

> **🔐 NEVER commit this file to Git.** It is already listed in `.gitignore`.

Alternatively, set up environment variables (see [Environment Variables](#-environment-variables)).

#### Business Keys — `backend/business-keys.json`

Add valid business key strings to `backend/business-keys.json` to allow user registration with that key:

```json
["BK-FLEET-001", "BK-FLEET-002", "BK-FLEET-003", "BK-DEMO-999"]
```

---

### 5. Start the Application

You need **two terminal windows/tabs** running simultaneously:

**Terminal 1 — Backend (Express API on port 5000):**

```bash
cd backend
npm run dev
# or: node server.js
```

**Terminal 2 — Frontend (Vite dev server on port 5173):**

```bash
# From root directory
npm run dev
```

Open your browser at: **http://localhost:5173**

> The Vite dev server is pre-configured to proxy all `/api` requests to `http://localhost:5000` (see `vite.config.js`), so both servers work seamlessly together.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

Create a `backend/.env` file if you want to use environment-based Firebase credentials instead of the service account JSON file:

```env
PORT=5000
FIREBASE_PROJECT_ID=fleet-33608
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@fleet-33608.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

> **Tip:** Wrap `FIREBASE_PRIVATE_KEY` in double quotes and keep the `\n` characters as-is.

---

## 🔧 Troubleshooting — Common npm Errors & Version Conflicts

### 1. `ERESOLVE unable to resolve dependency tree` (Peer Dependency Conflicts)

**Symptom:**
```
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! Could not resolve dependency:
npm ERR! peer react@"^17.0.0" from some-package
```

**Cause:** A dependency expects a different React version than the one installed (React 18).

**Fix — Use the legacy peer deps flag:**
```bash
npm install --legacy-peer-deps
```

Or set it permanently:
```bash
npm config set legacy-peer-deps true
npm install
```

---

### 2. `bcrypt` Native Module Build Failure

**Symptom:**
```
npm ERR! gyp ERR! build error
npm ERR! node-pre-gyp ERR! build error
```

**Cause:** `bcrypt` requires native C++ compilation with `node-gyp`. Missing build tools will cause this.

**Fix — Install build tools:**

- **macOS:**
  ```bash
  xcode-select --install
  ```

- **Windows:**
  ```bash
  npm install --global windows-build-tools
  # OR install Visual Studio Build Tools with "Desktop development with C++" workload
  ```

- **Ubuntu/Debian:**
  ```bash
  sudo apt-get install -y build-essential python3
  ```

**Alternative — Use `bcryptjs` (pure JS, no native deps):**
```bash
cd backend
npm uninstall bcrypt
npm install bcryptjs
```

Then update `require("bcrypt")` to `require("bcryptjs")` in `backend/routes/auth.js`. The API is identical.

---

### 3. Node.js Version Mismatch

**Symptom:**
```
error @vitejs/plugin-react@4.x.x: The engine "node" is incompatible with this module. Expected version ">=18.0.0".
```

**Fix:**
```bash
# Check your Node version
node --version

# If below v18, upgrade using nvm:
nvm install 18
nvm use 18

# Or install Node.js v18+ from https://nodejs.org/
```

---

### 4. `EACCES` Permission Errors (macOS/Linux)

**Symptom:**
```
npm ERR! Error: EACCES: permission denied
```

**Fix — Do NOT use `sudo npm install`. Instead, fix npm permissions:**
```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

Or use `nvm` (recommended), which avoids permission issues entirely.

---

### 5. `MODULE_NOT_FOUND` Errors After Install

**Symptom:**
```
Error: Cannot find module 'express'
```

**Fix:**
```bash
# Make sure you're in the right directory
cd backend
rm -rf node_modules package-lock.json
npm install
```

For the frontend:
```bash
# From root directory
rm -rf node_modules package-lock.json
npm install
```

---

### 6. Port Already in Use

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Fix:**
```bash
# Find the process using port 5000
lsof -i :5000          # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>          # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

Or change the backend port in `backend/.env`:
```env
PORT=5001
```

And update the Vite proxy in `vite.config.js`:
```javascript
proxy: {
  '/api': 'http://localhost:5001'
}
```

---

### 7. Tailwind CSS Not Working / Styles Not Applying

**Symptom:** Raw HTML appears without styling.

**Fix — Ensure PostCSS and Tailwind are properly installed:**
```bash
# From root directory
npm install -D tailwindcss postcss autoprefixer
```

Verify `postcss.config.js` and `tailwind.config.js` exist in the project root and that `src/index.css` includes:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### 8. `npm audit` Vulnerability Warnings

**Symptom:**
```
found X vulnerabilities (Y moderate, Z high)
```

**Fix:**
```bash
npm audit fix

# If that doesn't resolve it:
npm audit fix --force   # ⚠️ May introduce breaking changes — test after running
```

> Most audit warnings in dev dependencies do not affect production. Use your judgment.

---

### 9. Clearing Cache (Nuclear Option)

If nothing else works:
```bash
# Clear npm cache
npm cache clean --force

# Remove all node_modules and lock files
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json

# Reinstall everything
npm install
cd backend && npm install && cd ..
```

---

## 👥 User Roles & Access

| Role               | Accessible Pages                                            |
|--------------------|-------------------------------------------------------------|
| **Fleet Manager**  | Dashboard, Vehicle Registry, Maintenance, Analytics         |
| **Dispatcher**     | Dashboard, Trip Dispatcher                                  |
| **Safety Officer** | Dashboard, Maintenance, Performance                         |
| **Finance Analyst**| Dashboard, Trip & Expense, Analytics                        |

---

## 📡 API Endpoints

| Method | Endpoint                        | Description                         |
|--------|---------------------------------|-------------------------------------|
| POST   | `/api/auth/register`            | Register a new user                 |
| POST   | `/api/auth/login`               | Login with userId, password, role   |
| POST   | `/api/auth/validate-key`        | Validate a business key             |
| GET    | `/api/users/check-userid?userId=` | Check if a user ID is available   |

---

## 📊 Language Composition

| Language   | Percentage |
|------------|------------|
| JavaScript | 98.3%      |
| CSS        | 1.3%       |
| HTML       | 0.4%       |

---

## 📄 License

This project is for educational/demonstration purposes.

---

<p align="center">
  Built with ❤️ using React, Express & Firebase
</p>
