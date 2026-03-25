# API Reference

Base URL: `http://localhost:8000`

All endpoints (except `/api/accounts/token/`) require an `Authorization: Bearer <access_token>` header.

---

## Authentication

### Obtain Tokens

```
POST /api/accounts/token/
```

**Request body:**

```json
{
  "username": "dr.johnson",
  "password": "your-password"
}
```

**Response `200`:**

```json
{
  "access": "<jwt-access-token>",
  "refresh": "<jwt-refresh-token>"
}
```

---

### Refresh Access Token

```
POST /api/accounts/token/refresh/
```

**Request body:**

```json
{
  "refresh": "<jwt-refresh-token>"
}
```

**Response `200`:**

```json
{
  "access": "<new-access-token>",
  "refresh": "<new-refresh-token>"
}
```

Access tokens expire after **60 minutes**. Refresh tokens expire after **1 day** and rotate on each use.

---

## Users

> All user management endpoints require `ADMIN` role unless noted.

### List Users

```
GET /api/accounts/users/
```

Returns a paginated list of all users.

---

### Create User

```
POST /api/accounts/users/
```

```json
{
  "username": "dr.smith",
  "email": "dr.smith@estam.edu",
  "password": "securepassword",
  "role": "DOCTOR",
  "first_name": "John",
  "last_name": "Smith"
}
```

---

### Get / Update / Delete User

```
GET    /api/accounts/users/{id}/
PUT    /api/accounts/users/{id}/
PATCH  /api/accounts/users/{id}/
DELETE /api/accounts/users/{id}/
```

---

### Get Own Profile

```
GET /api/accounts/users/me/
```

Available to any authenticated user regardless of role.

---

### List Doctors

```
GET /api/accounts/users/doctors/
```

Returns all active users with `role = DOCTOR`. Used to populate the doctor selector in appointment forms.

---

## Patients

> All roles can access patient endpoints.

### List Patients

```
GET /api/clinic/patients/
```

**Query parameters:**

| Parameter  | Type   | Description                          |
|------------|--------|--------------------------------------|
| `search`   | string | Filter by name, matric no, or email  |
| `category` | string | `STUDENT` or `STAFF`                 |
| `page`     | int    | Page number (page size: 100)         |

---

### Create Patient

```
POST /api/clinic/patients/
```

```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "matric_number": "EUC/23/CS/042",
  "date_of_birth": "2000-05-15",
  "phone_number": "+2348012345678",
  "email": "jane.doe@estam.edu",
  "category": "STUDENT",
  "blood_group": "O+",
  "allergies": "Penicillin, Dust"
}
```

**Validation rules:**
- `date_of_birth` cannot be in the future.
- `phone_number` must be 13 characters or fewer.
- `matric_number` must be unique.

---

### Get / Update / Delete Patient

```
GET    /api/clinic/patients/{id}/
PUT    /api/clinic/patients/{id}/
PATCH  /api/clinic/patients/{id}/
DELETE /api/clinic/patients/{id}/
```

Deleting a patient cascades to all their appointments and medical records.

---

## Appointments

### List Appointments

```
GET /api/clinic/appointments/
```

**Query parameters:**

| Parameter | Type   | Description                            |
|-----------|--------|----------------------------------------|
| `date`    | string | Filter by date — format `YYYY-MM-DD`   |
| `status`  | string | `SCHEDULED`, `COMPLETED`, `CANCELLED`  |
| `doctor`  | int    | Filter by doctor user ID               |
| `search`  | string | Search by patient or doctor name       |
| `page`    | int    | Page number                            |

---

### Create Appointment

```
POST /api/clinic/appointments/
```

```json
{
  "patient": 12,
  "doctor": 3,
  "scheduled_at": "2026-04-10T09:00:00Z",
  "status": "SCHEDULED",
  "reason": "General consultation"
}
```

**Business rules enforced:**
- `scheduled_at` must be in the future.
- `doctor` must have `role = DOCTOR`.
- The doctor cannot have another non-cancelled appointment at the same `scheduled_at`.

---

### Get / Update / Delete Appointment

```
GET    /api/clinic/appointments/{id}/
PUT    /api/clinic/appointments/{id}/
PATCH  /api/clinic/appointments/{id}/
DELETE /api/clinic/appointments/{id}/
```

Updating `scheduled_at` re-runs the double-booking check (excluding the current appointment).

---

## Medical Records

> Requires `DOCTOR` role to create or modify.

### List Records

```
GET /api/clinic/records/
```

---

### Create Medical Record

```
POST /api/clinic/records/
```

```json
{
  "appointment": 7,
  "diagnosis": "Upper respiratory tract infection",
  "treatment_plan": "Rest and fluids for 5 days",
  "prescriptions": "Amoxicillin 500mg — 3x daily for 7 days",
  "follow_up_instructions": "Return if symptoms persist beyond 7 days"
}
```

**Business rules enforced:**
- Each appointment can have at most one medical record (enforced by `OneToOne` constraint).
- Receptionists cannot set the `prescriptions` field.

---

### Get / Update / Delete Record

```
GET    /api/clinic/records/{id}/
PUT    /api/clinic/records/{id}/
PATCH  /api/clinic/records/{id}/
DELETE /api/clinic/records/{id}/
```

---

## Dashboard

### Stats

```
GET /api/clinic/dashboard/
```

Returns aggregate counts and a 7-day chart series for the dashboard overview.

**Response `200`:**

```json
{
  "todays_appointments": 12,
  "new_patients": 5,
  "pending_appointments": 8,
  "chart_data": [
    { "date": "2026-03-19", "day": "Wed", "patients": 4 },
    { "date": "2026-03-20", "day": "Thu", "patients": 7 },
    ...
  ]
}
```

---

## Error Responses

| Status | Meaning                                              |
|--------|------------------------------------------------------|
| `400`  | Validation error — response body contains field errors |
| `401`  | Missing or expired token                            |
| `403`  | Authenticated but insufficient role                  |
| `404`  | Resource not found                                   |
| `405`  | HTTP method not allowed                              |

Validation errors follow DRF's standard format:

```json
{
  "scheduled_at": ["Cannot book in the past."],
  "doctor": ["Appointments can only be assigned to users with the DOCTOR role."]
}
```