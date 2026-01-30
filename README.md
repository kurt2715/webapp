# Webapp (Frontend + Backend)

This repo contains a simple blog frontend (Vite) and a FastAPI backend scaffold.

## Structure

```
webapp/
  frontend/   # Vite app (HTML/CSS/JS)
  backend/    # FastAPI app (Python)
```

## Repo vs Architecture

- **Monorepo (same repo):** frontend and backend live in one Git repo.
- **Frontend/Backend separation (architecture):** frontend and backend are separate apps/services.

This project uses a **monorepo** but still keeps a **separated frontend/backend architecture**.

## Frontend

- Location: `frontend/`
- Dev server: `npm run dev`
- Build output: `frontend/dist/`

## Backend

- Location: `backend/`
- Entry: `backend/app/main.py`
- Dependencies: `backend/requirements.txt`

## Notes

- `frontend/dist/` is build output and can be regenerated.
- `.env` is ignored; use `backend/.env.example` as a template.
