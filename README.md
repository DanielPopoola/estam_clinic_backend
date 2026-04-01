# ESTAM University Clinic — Healthcare Management System

A full-stack clinic management platform purpose-built for ESTAM University Health Services. It enables receptionists to register patients and book appointments, doctors to write clinical records and prescriptions, and administrators to manage staff — all behind JWT-authenticated role-based access control.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## Features

- **Patient Management** — Register, search, and manage student and staff patients with full demographic and medical history data.
- **Appointment Scheduling** — Book, reschedule, and cancel appointments with automatic double-booking prevention.
- **Clinical Records** — Doctors write diagnoses, treatment plans, prescriptions, and follow-up instructions per appointment visit.
- **Role-Based Access Control** — Three roles with distinct permissions: Admin, Doctor, Receptionist.
- **Dashboard Analytics** — Live stats for today's appointments, new patients, pending visits, and a 7-day patient traffic chart.
- **Staff Management** — Admins can view and manage all clinic personnel.
- **JWT Authentication** — Secure token-based auth with automatic silent refresh.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Backend   | Python 3.12, Django 6, Django REST Framework    |
| Auth      | SimpleJWT (access + refresh token rotation)     |
| Database  | PostgreSQL (via `django-environ` / `DATABASE_URL`) |
| Frontend  | React 18, TypeScript, Vite                      |
| Styling   | Tailwind CSS v4, shadcn/ui components           |
| Charts    | Recharts                                        |
| Animations| Motion (Framer Motion v12)                      |
| HTTP      | Axios (with interceptor-based token refresh)    |
| API Docs  | drf-spectacular (OpenAPI 3 / Swagger UI)        |
| Testing   | pytest-django, pytest-cov                       |
| Linting   | Ruff                                            |

---

## Prerequisites

- Python 3.12+
- Node.js 18+ and npm
- PostgreSQL 14+

---

## Getting Started

### Backend

```bash
# 1. Clone the repository
git clone https://github.com/DanielPopoola/estam_clinic_backend
cd estam-clinic

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -e ".[dev]"
# or with uv:
uv sync

# 4. Copy and configure environment variables
cp .env.example .env
# Edit .env — see Environment Variables section below

# 5. Run database migrations
python manage.py migrate

# 6. Create a superuser (Admin role)
python manage.py createsuperuser

## Demo seed command

A seed management command is available to quickly generate demo users, roles, and related clinic data:

```bash
python manage.py seed_demo_data
```

What it creates (idempotently):

- 4 users (`admin_demo`, 2 doctors, 1 receptionist)
- 3 patients
- 2 appointments (one completed, one scheduled)
- 1 medical record for the completed appointment

Useful options:

```bash
python manage.py seed_demo_data --password "YourPassword123!"
python manage.py seed_demo_data --reset
```

# 7. Start the development server
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
DATABASE_URL=postgres://user:password@localhost:5432/estam_clinic
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

For the frontend, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

---

## Running Tests

```bash
# Run the full test suite with coverage
pytest

# Run a specific test module
pytest accounts/tests/test_api.py

# Run with verbose output
pytest -v
```

Coverage reports are generated in `htmlcov/` after each run.

---

## API Documentation

When `drf-spectacular` is installed, interactive Swagger UI is available at:

- **Swagger UI:** `http://localhost:8000/api/docs/`
- **OpenAPI Schema:** `http://localhost:8000/api/schema/`

A pre-generated schema is also committed at `schema.yml`.

---

## Project Structure

```
estam-clinic/
├── accounts/           # Custom user model, JWT auth, RBAC permissions
├── clinic/             # Patients, appointments, medical records, dashboard
├── backend/            # Django project settings, URLs, WSGI/ASGI
├── frontend/           # React + TypeScript SPA
│   └── src/
│       ├── app/        # Routes, layouts, pages, context
│       └── lib/        # Axios API client, TypeScript types
├── schema.yml          # OpenAPI 3 schema
├── pyproject.toml      # Python dependencies and tooling config
└── manage.py
```

---

## Contributing

1. Fork the repository and create a feature branch.
2. Write tests for any new behaviour.
3. Ensure `pytest` passes and `ruff check .` reports no errors.
4. Open a pull request with a clear description of the change.
