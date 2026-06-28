# PanelForge

> An AI-powered comic creation studio — describe a story idea, pick an art style, and PanelForge generates a full illustrated comic page: story, dialogue, panel art, and layout.

**Status:** Work in progress — personal/portfolio project, actively being built and debugged.

---

## What it does

PanelForge takes a short story prompt and turns it into a complete comic:

1. **Story generation** — a local LLM (Mistral 7B via Ollama) expands your prompt into a title, storyline, characters, moral, and per-panel descriptions with dialogue.
2. **Image generation** — each panel is rendered locally with Stable Diffusion (sd-turbo), using the art style and quality settings you choose.
3. **Layout composition** — panels are assembled into a single comic-page layout image.
4. **History & dashboard** — every comic you generate is saved to your account, with a history grid, a detail view per comic, and a dashboard showing your usage stats (comics created, panels generated, styles used, average quality).

Everything runs against your own local AI stack — no third-party image/story generation API calls.

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript, Framer Motion |
| Backend (app/API) | Spring Boot (Java), Spring Security, JWT auth |
| Database | PostgreSQL, Hibernate/JPA |
| AI backend | Python, FastAPI, Stable Diffusion (sd-turbo), Mistral 7B via Ollama |

### Architecture at a glance

```
┌─────────────┐      ┌──────────────────┐      ┌───────────────────────┐
│   React     │ ───► │  Spring Boot API │ ───► │      PostgreSQL       │
│  Frontend   │      │  (auth, comics,  │      │ (users, comics,       │
│             │      │   workspace)     │      │  workspace stats)     │
└─────────────┘      └──────────────────┘      └───────────────────────┘
       │
       │  (direct call for generation)
       ▼
┌──────────────────────┐
│   FastAPI (Python)   │
│  Mistral 7B (Ollama) │
│  Stable Diffusion    │
│       (sd-turbo)     │
└──────────────────────┘
```

The frontend talks to the Python FastAPI service directly for the actual generation step (story + images), then saves the finished comic to the Spring Boot backend for persistence and history.

---

## Features

- **Email/password auth** with JWT access + refresh tokens, automatic silent token refresh on expiry
- **Comic Crafter** — prompt input, art style picker, advanced controls (panel count, resolution, quality steps, guidance scale)
- **History** — filterable grid of past comics (all / completed / processing), with a detail modal showing storyline, characters, moral, and every generated panel
- **Dashboard** — live stats (comics created, panels generated, distinct styles used, average quality-by-steps), recent comics list, credits-remaining meter scaled to your plan
- **Downloads** — export the comic layout, individual panels, or the story as markdown

---

## Project structure

```
panel-forge/
├── backend/panel-forge                  # Spring Boot application
│   └── src/main/java/com/panelforge/panel_forge/
│       ├── Model/             # JPA entities, repositories, services
│       ├── Controller/        # REST controllers
│       ├── Security/          # JWT, Spring Security config, rate limiting
│       ├── dto/                # Request/response DTOs
│       └── Exception/          # Custom exceptions
│
├── server.py               # story generation (Mistral) + image generation (sd-turbo)
│    
└── src/
    ├── PageDashboard.tsx
    ├── PageCrafter.tsx
    ├── PageHistory.tsx
    ├── Sidebar.tsx
    ├── tokens.ts            # design tokens, shared static data
    ├── components.tsx
    └── api.ts               # authedFetch — shared API client w/ auto token refresh
```

---

## Getting started

### Prerequisites

- **Java 17+** and Maven (Spring Boot backend)
- **Python 3.10+** (AI backend)
- **Node.js 18+** and npm/yarn (frontend)
- **PostgreSQL** running locally
- **Ollama** installed, with the `mistral` model pulled
- A GPU is strongly recommended for image generation (CPU-only sd-turbo is very slow)

### 1. Database

Create a Postgres database and update credentials in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/panelforge
spring.datasource.username=your_user
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

jwt.secret.access=<base64-encoded-secret>
jwt.secret.refresh=<base64-encoded-secret>
```

### 2. Spring Boot backend

```bash
cd backend
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`.

### 3. Python AI backend

```bash
cd ai-backend
pip install fastapi uvicorn diffusers transformers accelerate torch pillow requests --break-system-packages

# pull the local LLM used for story generation
ollama pull mistral

uvicorn server:app --host 0.0.0.0 --port 8000
```

Runs on `http://localhost:8000`. The Crafter page polls `/health` on this service and shows an online/offline indicator.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` (Vite default). CORS on the Spring Boot backend is currently configured for this exact origin.

---

## Known limitations / in-progress areas

This is an actively evolving personal project — a few things are intentionally rough edges right now:

- **No real image quality scoring** — "Avg. Quality" is currently a proxy based on diffusion step count, not a measured aesthetic/quality score.
- **No "Styles Used" backend field** — computed client-side from comic history rather than stored.
- **Generation is local-only** — no hosted/cloud inference; you need your own GPU-capable machine running Ollama + sd-turbo.
- **No payments/plan upgrade flow** — plan tiers exist as data but there's no way to actually change plans yet.
- **Generation activity chart** on the dashboard is currently static placeholder data.

---

## License

Not yet decided — personal project, all rights reserved for now.
