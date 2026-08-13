# FAST Connect

A full-stack social network built for the FAST-NUCES university community — profiles, posts, friends, real-time-style messaging, blogs, and admin moderation, all in one app.

**Live:** [fast-connect-frontend-three.vercel.app](https://fast-connect-frontend-three.vercel.app)

## Features

- **Auth** — signup/login with JWT, forgot/reset password via email
- **Profiles** — editable bio, profile picture (Cloudinary), public profile view
- **Posts** — create/edit/delete posts with optional image attachments, likes, comments
- **Friends** — send/accept/reject friend requests, friends list
- **Messaging** — direct messages between friends
- **Blogs** — long-form posts separate from the feed
- **Reports & Feedback** — users can report a post, comment, or profile; the report captures a server-side snapshot ("proof") of the reported content so it can be reviewed even if later edited or deleted
- **Admin portal** — a fully separate app/deployment (own domain) for moderation: view stats, manage users, and resolve reports by dismissing, restricting, or temporarily banning (7 days, auto-expires) the offending account
- **FAST AI** — an AI companion (Google Gemini) pinned as a special contact in Messages, for casual chat, study help, or when your friends are offline; conversation history persists per user

## Tech Stack

**Backend**
- FastAPI + Uvicorn
- MongoDB Atlas (via `pymongo`'s async client)
- JWT auth (`PyJWT`) + `bcrypt` password hashing
- Cloudinary for image uploads
- SMTP email (password reset, friend request/message notifications)
- Google Gemini API (free tier) for the FAST AI companion

**Frontend**
- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- Context API for auth and theme (light/dark) state

**Deployment**
- Three separate Vercel projects, one shared backend: `Backend` (API), `Frontend` (public site), `Admin` (moderation portal, own domain)
- MongoDB Atlas (cloud-hosted)

## Project Structure

```
Fast_Connect/
├── Backend/
│   └── app/
│       ├── routers/        # API route handlers (auth, profile, post, friend, message, blog, report, feedback, admin, upload, chatbot)
│       ├── schemas/        # Pydantic request/response models
│       ├── services/       # Business logic per feature
│       ├── database/       # MongoDB connection
│       ├── dependencies.py # Shared auth dependencies (get_current_user, get_current_admin)
│       └── main.py         # FastAPI app entrypoint
├── api/
│   └── index.py            # Vercel serverless entrypoint for the backend
├── Frontend/                # Public user-facing site
│   └── src/
│       ├── pages/          # Route-level components (Feed, Login, MyProfile, etc.)
│       ├── layouts/        # Shared layout wrappers (app shell, auth layout)
│       ├── context/        # AuthContext, ThemeContext
│       ├── components/     # Reusable UI pieces (incl. ReportButton)
│       ├── routes/         # Route guards
│       └── utils/          # Helpers (error formatting, initials, etc.)
├── Admin/                   # Standalone admin portal — separate app, separate deployment/domain
│   └── src/
│       ├── pages/          # Login, Dashboard (users + reports tabs)
│       ├── layouts/        # AdminLayout
│       ├── context/        # AuthContext (rejects non-admin logins)
│       └── routes/         # AdminRoute guard
└── LEARNING_NOTES.md        # Personal FastAPI/MongoDB/React syntax & concept notes
```

## Getting Started

### Backend

```bash
cd Backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r ../requirements.txt
```

Create a `.env` file inside `Backend/` with:

```
MONGO_URI=your_mongodb_atlas_connection_string
SECRET_KEY=your_jwt_secret
JWT_ALGORITHM=HS256

MAIL_ENABLED=false          # set true once SMTP is configured
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GEMINI_API_KEY=              # powers the FAST AI companion (Google Gemini, free tier) — get one at aistudio.google.com/apikey
```

Without `GEMINI_API_KEY` set, `/chatbot/chat` returns a clear 503 rather than crashing — every other feature keeps working.

Run the API:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Admin

```bash
cd Admin
npm install
npm run dev
```

The portal will be available at `http://localhost:5174` (or the next free port). Log in with an account whose `role` field is `"admin"` in MongoDB — any other account is rejected at login. There's no signup flow here on purpose; promote a user to admin by editing their document directly in MongoDB Atlas.

## Deployment Notes

- Backend, Frontend, and Admin are deployed as **three separate Vercel projects**, each with its own environment variables set in the Vercel dashboard (not read from local `.env` files). Admin lives on its own domain and ships none of the public site's code, and vice versa.
- Both `Frontend/vercel.json` and `Admin/vercel.json` include an SPA rewrite (`/(.*) → /index.html`) so client-side routes survive a page reload.
- `api/index.py` re-exports the FastAPI `app` from `Backend/` so Vercel's Python runtime can serve it as a serverless function.
- CORS on the backend (`Backend/app/main.py`) must list both the Frontend and Admin production domains, plus `localhost:5173`/`localhost:5174` for local dev. Update the `fast-connect-admin.vercel.app` placeholder once the Admin project's real domain is known.
