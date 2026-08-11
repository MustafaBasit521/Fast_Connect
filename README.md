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
- **Reports & Feedback** — users can report content or leave feedback for admins
- **Admin dashboard** — separate moderation view for managing users/reports, kept apart from the normal user experience

## Tech Stack

**Backend**
- FastAPI + Uvicorn
- MongoDB Atlas (via `pymongo`'s async client)
- JWT auth (`PyJWT`) + `bcrypt` password hashing
- Cloudinary for image uploads
- SMTP email (password reset, friend request/message notifications)

**Frontend**
- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- Context API for auth and theme (light/dark) state

**Deployment**
- Backend and frontend are deployed as two separate Vercel projects
- MongoDB Atlas (cloud-hosted)

## Project Structure

```
Fast_Connect/
├── Backend/
│   └── app/
│       ├── routers/        # API route handlers (auth, profile, post, friend, message, blog, report, feedback, admin, upload)
│       ├── schemas/        # Pydantic request/response models
│       ├── services/       # Business logic per feature
│       ├── database/       # MongoDB connection
│       ├── dependencies.py # Shared auth dependencies (get_current_user, get_current_admin)
│       └── main.py         # FastAPI app entrypoint
├── api/
│   └── index.py            # Vercel serverless entrypoint for the backend
├── Frontend/
│   └── src/
│       ├── pages/          # Route-level components (Feed, Login, MyProfile, etc.)
│       ├── layouts/        # Shared layout wrappers (app shell, admin layout, auth layout)
│       ├── context/        # AuthContext, ThemeContext
│       ├── components/     # Reusable UI pieces
│       ├── routes/         # Route guards
│       └── utils/          # Helpers (error formatting, initials, etc.)
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
SMTP_USERNAME=
SMTP_PASSWORD=
MAIL_FROM=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

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

## Deployment Notes

- Backend and frontend are deployed as **separate Vercel projects**, each with its own environment variables set in the Vercel dashboard (not read from local `.env` files).
- The frontend's `vercel.json` includes an SPA rewrite (`/(.*) → /index.html`) so client-side routes survive a page reload.
- `api/index.py` re-exports the FastAPI `app` from `Backend/` so Vercel's Python runtime can serve it as a serverless function.
- CORS on the backend is restricted to the deployed frontend origin and `localhost:5173` for local development.
