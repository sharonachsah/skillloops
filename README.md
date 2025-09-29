# SkillLoops — Micro-learning + Practice Loops

**SkillLoops** is an interview-friendly full-stack project: bite-sized micro-courses, lessons.
This repo provides a Vite + React frontend, Node + Express backend, MongoDB (Mongoose) models, Firebase Auth integration and seed data to quickly demo functionality.

---

## Table of contents

* [Demo / Purpose](#demo--purpose)
* [Features](#features)
* [Tech stack](#tech-stack)
* [Repo structure](#repo-structure)
* [Setup (local)](#setup-local)

  * [Prerequisites](#prerequisites)
  * [Backend env vars](#backend-env-vars)
  * [Frontend env vars](#frontend-env-vars)
  * [Install & run](#install--run)
* [Seeding the database](#seeding-the-database)
* [API reference (important endpoints)](#api-reference-important-endpoints)
* [Frontend notes](#frontend-notes)
* [Deployment suggestions](#deployment-suggestions)
* [Troubleshooting & common fixes](#troubleshooting--common-fixes)
* [Extending & next steps](#extending--next-steps)
* [License](#license)

---

## Demo / Purpose

SkillLoops demonstrates a realistic interview project showcasing:

* Full-stack design (React + Node + MongoDB)
* Auth (Firebase client + Admin verification on server)
* Role-based actions (creator vs learner)
* Good UI/UX foundations (Tailwind + Headless UI)
* Product thinking: micro-courses, lessons, challenges, progress, leaderboards

Seed data models real learning content: JS fundamentals, React, Node, DB, algorithms, coding stubs and MCQs.

---

## Features

* Firebase Auth (Email/Password + Google) on client; server verifies ID tokens via Firebase Admin.
* CRUD for Courses, Lessons.
* TailwindCSS for layout, Headless UI optional for components.
* Seed script that inserts meaningful sample data.
* REST API versioned at `/api/v1`.

---

## Tech stack

* Frontend: React + Vite, React Router, TailwindCSS, Axios, Zustand (or Context), React Query (optional)
* Backend: Node.js (ESM) + Express, Mongoose (MongoDB Atlas or local), Firebase Admin SDK (token verification), Socket.IO
* Database: MongoDB (Atlas recommended)
* Deployment: Vercel (frontend), Render/Railway (backend) suggested

---

## Repo structure

```
skillloops/
├─ frontend/
│  ├─ package.json
│  ├─ vite.config.js
│  └─ src/
│     ├─ main.jsx
│     ├─ App.jsx
│     ├─ firebase.js
│     ├─ services/
│     │  ├─ api.js
│     │  └─ socket.js
│     ├─ context/
│     │  └─ AuthContext.jsx
│     ├─ pages/
│     │  ├─ Home.jsx
│     │  ├─ Onboarding.jsx
│     │  ├─ Course.jsx
│     │  ├─ Practice.jsx
│     │  └─ Room.jsx
│     └─ components/
│        └─ CourseCard.jsx
├─ backend/
│  ├─ package.json
│  ├─ server.js
│  └─ src/
│     ├─ app.js
│     ├─ db.js
│     ├─ controllers/
│     │  └─ coursesController.js
│     ├─ models/
│     │  ├─ User.js
│     │  ├─ Lesson.js
│     │  ├─ Challenge.js
│     │  ├─ Course.js
│     │  └─ Room.js
│     ├─ routes/
│     │  ├─ auth.js
│     │  ├─ courses.js
│     │  ├─ challenges.js
│     │  └─ rooms.js
│     └─ scripts/
│        └─ seed.js
├─ README.md
└─ .env.example
```

---

## Setup (local)

### Prerequisites

* Node.js v18+ (works with v20+)
* npm
* MongoDB Atlas account or local MongoDB running
* Firebase project (for Auth)

  * Create a Web App in Firebase console → client config (for frontend)
  * Create a Service Account and download JSON for Admin SDK (for backend verification)

### Backend env vars

Create `backend/.env` (do **not** commit):

```
PORT=4000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/skillloops?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
# Put the entire Firebase service account JSON string, properly escaped (or use secrets manager)
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account", ... }'
```

> For local quick testing you can omit the FIREBASE env and temporarily bypass auth middleware — **but avoid this for production.**

### Frontend env vars

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:4000/api/v1
VITE_SOCKET_URL=http://localhost:4000
```

### Install & run

Backend:

```bash
cd backend
npm install
# run dev (nodemon)
npm run dev
# or start directly
node server.js
```

Frontend:

```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

---

## Seeding the database

A seed script creates realistic sample data (users, lessons, challenges, courses, rooms).

From `backend/`:

```bash
# ensure env (MONGO_URI) set
node src/scripts/seed.js
# or
npm run seed
```

If you hit index errors, run the small drop-index steps included in the seed (seed already attempts to drop problematic indexes). If errors persist, use `mongosh` to drop indexes on collections `challenges` and `courses`.

---

## API reference (important endpoints)

> Base: `http://localhost:4000/api/v1`

* `POST /auth/sync` — verify ID token (Authorization: Bearer <idToken>) and upsert backend User.

* `GET /auth/me` — fetch current user (Authorization required).

* `POST /auth/profile` — update avatar, skills, xp (Authorization required).

* `GET /courses` — list courses.

* `GET /courses/:id` — get course (includes embedded lessons and challenge refs).

* `POST /courses` — create course (Authorization required).

* `POST /courses/:courseId/lessons` — add a lesson (Authorization required).

---

## Frontend notes

* Firebase client config in `frontend/src/firebase.js` — replace with your project values (apiKey, projectId, authDomain, etc.).
* `services/api.js` attaches Firebase ID token to every request (when user is logged in) so backend can verify.
* Onboarding flow fixed: when logged-in, `Onboarding.jsx` shows profile editor; guests see sign-in/signup form.

---

## Deployment suggestions

* **Frontend**: deploy to Vercel (connect repo). Set environment variables in Vercel UI (`VITE_API_URL`, `VITE_SOCKET_URL`).
* **Backend**: deploy to Render, Railway, or Heroku. Set env vars (`MONGO_URI`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `CLIENT_ORIGIN`).
* Use MongoDB Atlas for production (avoid public IP whitelist in production; use VPC peering/secure network).

---

## Troubleshooting & common fixes

* `ERR_MODULE_NOT_FOUND` when running seed or server:

  * Ensure files are in `backend/src/models/*.js` and imports use `../models/...` from `src` subfolders.
  * Confirm `package.json` has `"type": "module"` if using `import` syntax (we use ESM).

* Seed errors about text index and arrays:

  * The seed script attempts to `dropIndexes` on `challenges` and `courses`. If seed still fails, manually drop indexes with `mongosh`:

* Auth issues:

  * Make sure `FIREBASE_SERVICE_ACCOUNT_JSON` is the full JSON string for the service account; parse issues often cause token verification failures.
  * Ensure client Firebase config matches the web app settings.

---

## Extending & next steps

Ideas you can add to make SkillLoops production-ready:

* Webhooks / notifications (email or push) for challenge invites.
* Persistent friend lists & social graph.
* Automated challenge generation with LLMs (careful on correctness & safety).
* Coding challenge runner (secure sandbox).
* Unit & integration tests (`mongodb-memory-server`, Jest, Supertest).
* CI/CD via GitHub Actions, automated seed on staging.

---

## Contributors & Contact

* Built as a learning / interview project template.
* If you want guided additions (admin UI, challenge runner, deployment configs), open an issue or PR in the repo.

---

## License

MIT — feel free to use and adapt. Please do not ship copyrighted third-party assets.
