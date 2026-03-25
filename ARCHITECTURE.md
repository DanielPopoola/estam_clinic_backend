# Architecture Overview

This document describes the technical architecture of the ESTAM University Clinic system — how the layers are structured, how they communicate, and why the key design decisions were made.

---

## Table of Contents

- [System Overview](#system-overview)
- [Backend Architecture](#backend-architecture)
  - [Layer Structure](#layer-structure)
  - [App Breakdown](#app-breakdown)
  - [Service Layer Pattern](#service-layer-pattern)
  - [Selectors Pattern](#selectors-pattern)
  - [Authentication and Authorization](#authentication-and-authorization)
  - [Database Design](#database-design)
- [Frontend Architecture](#frontend-architecture)
  - [Routing](#routing)
  - [Auth Context](#auth-context)
  - [API Client](#api-client)
- [Data Flow](#data-flow)
- [Key Design Decisions](#key-design-decisions)

---

## System Overview

```
┌─────────────────────────────────────────────────┐
│               React SPA (Vite)                  │
│  LoginPage  Dashboard  Patients  Appointments   │
│  ClinicalRecord  StaffManagement                │
│                                                 │
│  AuthContext  →  axios (api.ts)                 │
└─────────────────────┬───────────────────────────┘
                      │  HTTP / JSON (Bearer JWT)
┌─────────────────────▼───────────────────────────┐
│          Django REST Framework API              │
│                                                 │
│  /api/accounts/  →  accounts app               │
│  /api/clinic/    →  clinic app                 │
│                                                 │
│  Views  →  Serializers  →  Services            │
│                        →  Selectors            │
└─────────────────────┬───────────────────────────┘
                      │  Django ORM
┌─────────────────────▼───────────────────────────┐
│                  PostgreSQL                     │
│   users  patients  appointments  medical_records│
└─────────────────────────────────────────────────┘
```

---

## Backend Architecture

### Layer Structure

The backend follows a deliberate four-layer architecture, keeping each concern separated:

```
Request
  └── View (HTTP in/out, auth, permissions)
        └── Serializer (validation, shape)
              └── Service (business rules, writes)
              └── Selector (queries, reads)
                    └── Django ORM
                          └── PostgreSQL
```

No layer skips another. Views never query the database directly, and services never touch `request` objects.

### App Breakdown

**`accounts/`**

Owns everything related to users and authentication.

- `models.py` — `User` extends `AbstractUser`, adding an `email` unique constraint and a `role` field (`ADMIN`, `DOCTOR`, `RECEPTIONIST`).
- `serializers.py` — `UserSerializer` handles password hashing on both create and update, keeping that logic out of views.
- `permissions.py` — Three DRF permission classes (`IsAdmin`, `IsDoctor`, `IsReceptionist`) that check `request.user.role`.
- `views.py` — `UserViewSet` with two extra actions: `me/` (own profile) and `doctors/` (for populating appointment forms).
- `urls.py` — Registers the viewset and the SimpleJWT token endpoints.

**`clinic/`**

Owns all clinical domain objects.

- `models.py` — `Patient`, `Appointment`, `MedicalRecord`. The `Appointment → doctor` FK uses `on_delete=PROTECT` so historical records are never orphaned. The `Appointment → patient` FK uses `CASCADE` so deleting a patient cleans up all their data.
- `serializers.py` — Nested read-only `*_details` fields on `AppointmentSerializer` and `MedicalRecordSerializer` reduce the number of client-side requests.
- `services.py` — All write operations with business rules (see below).
- `selectors.py` — All read-only queries (see below).
- `views.py` — Thin viewsets that delegate to services and selectors.

### Service Layer Pattern

Services live in `clinic/services.py` and own all business rules for writes. They are plain Python functions that accept keyword-only arguments and raise `django.core.exceptions.ValidationError` on rule violations.

Example rules enforced in services:

- `create_appointment` — rejects past datetimes, non-doctor assignees, and double-booked slots.
- `create_medical_record` — rejects prescriptions written by a Receptionist role.
- `update_appointment` — re-checks the double-booking constraint while excluding the appointment being updated.

Views catch `ValidationError` and re-raise it as DRF's `ValidationError` so the API returns a proper `400` response.

This pattern keeps views thin and business logic fully unit-testable without HTTP overhead.

### Selectors Pattern

Read-only queries live in `clinic/selectors.py`. They are also plain Python functions returning querysets or single objects.

```python
def get_appointments_for_doctor(doctor_user)
def is_doctor_double_booked(doctor_user, scheduled_at, *, exclude_appointment_id=None)
def get_medical_record_for_appointment(appointment)
```

Separating reads from writes means the double-booking check is reusable by both `create_appointment` and `update_appointment` without duplication.

### Authentication and Authorization

- **SimpleJWT** handles token issuance and refresh. Access tokens expire after 60 minutes; refresh tokens after 1 day.
- `ROTATE_REFRESH_TOKENS = True` means each use of the refresh endpoint issues a new refresh token (rolling window).
- The DRF default permission is `IsAuthenticated`, so every endpoint requires a valid Bearer token unless explicitly overridden.
- Role checks are done with custom `BasePermission` classes, not Django's group/permission system, keeping the model simple for a three-role domain.

### Database Design

```
User (accounts_user)
  id, username, email, password, role, is_active, ...

Patient (clinic_patient)
  id, first_name, last_name, matric_number (unique),
  date_of_birth, phone_number, email, address,
  category (STUDENT|STAFF), blood_group, allergies,
  emergency_contact_name, emergency_contact_phone,
  created_at, updated_at

Appointment (clinic_appointment)
  id, patient_id → Patient (CASCADE),
  doctor_id → User (PROTECT),
  scheduled_at, status (SCHEDULED|COMPLETED|CANCELLED),
  reason, notes, created_at, updated_at

MedicalRecord (clinic_medicalrecord)
  id, appointment_id → Appointment (CASCADE, OneToOne),
  diagnosis, treatment_plan, prescriptions,
  follow_up_instructions, created_at, updated_at
```

The `OneToOne` on `MedicalRecord.appointment` is enforced at both the database level (unique constraint) and the serializer level (DRF's unique validator).

---

## Frontend Architecture

The frontend is a single-page React application structured around feature-level pages with shared context and a centralised API client.

```
frontend/src/
├── app/
│   ├── App.tsx                 # Root: AuthProvider + RouterProvider + Toaster
│   ├── routes.tsx              # createBrowserRouter, ProtectedRoute wrapper
│   ├── layouts/
│   │   └── DashboardLayout.tsx # Sidebar + topbar shell, renders <Outlet />
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Patients.tsx
│   │   ├── Appointments.tsx
│   │   ├── ClinicalRecord.tsx
│   │   └── StaffManagement.tsx
│   ├── components/
│   │   ├── ProtectedRoute.tsx  # Redirect to /login if no user
│   │   └── ui/                 # shadcn/ui component primitives
│   └── context/
│       └── AuthContext.tsx     # User state, login, logout
└── lib/
    ├── api.ts                  # Axios instance + all API call functions
    └── types.ts                # TypeScript interfaces for all API shapes
```

### Routing

React Router v7 with `createBrowserRouter`. All authenticated pages are children of the `DashboardLayout` route, which is wrapped in `ProtectedRoute`. If no token exists in `localStorage`, the user is immediately redirected to `/login`.

### Auth Context

`AuthContext` is the single source of truth for the logged-in user. On mount it checks for an existing access token in `localStorage` and calls `/api/accounts/users/me/` to rehydrate the user object. It exposes `login`, `logout`, `isAdmin`, `isDoctor`, and `isReceptionist` to any component in the tree.

### API Client

`api.ts` exports a single Axios instance with two interceptors:

1. **Request interceptor** — attaches `Authorization: Bearer <token>` to every non-auth request.
2. **Response interceptor** — on a `401`, attempts a silent token refresh. If refresh succeeds, the original request is retried. If it fails, tokens are cleared and the user is redirected to `/login`. A queue prevents multiple simultaneous refresh attempts from racing.

All API modules (`patientsApi`, `appointmentsApi`, etc.) are plain objects of functions built on this shared instance, keeping call sites clean.

---

## Data Flow

**Booking an appointment (happy path):**

```
User fills form → appointmentsApi.create(payload)
  → POST /api/clinic/appointments/
  → AppointmentViewSet.perform_create(serializer)
  → create_appointment(**serializer.validated_data)
    → is_doctor_double_booked(...)   [selector]
    → Appointment.objects.create(...)
  → 201 Created
  → UI updates list optimistically
```

**Token expiry:**

```
Any API call → 401 response
  → Response interceptor triggers
  → POST /api/accounts/token/refresh/  with refresh token
  → New access token stored
  → Original request retried automatically
  → User session continues uninterrupted
```

---

## Key Design Decisions

**Service layer over fat models or fat views**

Business rules live in `services.py` functions rather than model methods or view logic. This makes them easy to test in isolation (no HTTP, no serializer) and easy to call from management commands, background tasks, or tests without bootstrapping a full request cycle.

**Selector functions over inline queries**

The `is_doctor_double_booked` selector is used by both `create_appointment` and `update_appointment`. Extracting it prevents duplication and makes it independently testable.

**`on_delete=PROTECT` for doctor FK**

A doctor being deleted would silently orphan all historical appointment and medical record data. `PROTECT` forces an explicit decision — deactivate the user instead of deleting them.

**Nested read-only `_details` fields**

`AppointmentSerializer` includes `doctor_details` and `patient_details` as read-only nested fields. This means the appointment list endpoint returns everything the UI needs in one round-trip, without the client having to join data from multiple endpoints.

**Flat `api.ts` module**

Rather than a class-based API client or React Query integration, the API layer is a collection of plain async functions grouped by domain. This keeps the surface area minimal, the mental model simple, and avoids adding a heavy dependency before the project is ready for it.