# Estam Clinic Backend

## Database schema (quick overview)

The backend uses Django ORM with a custom user model (`accounts.User`) and clinic entities (`clinic` app):

- `accounts.User`
  - extends `AbstractUser`
  - `email` (unique)
  - `role` enum: `ADMIN`, `DOCTOR`, `RECEPTIONIST`
- `clinic.Patient`
  - patient bio data and identifiers (`matric_number` is unique)
  - category enum: `STUDENT` or `STAFF`
- `clinic.Appointment`
  - belongs to one `Patient`
  - belongs to one doctor (`accounts.User` with role `DOCTOR`)
  - status enum: `SCHEDULED`, `COMPLETED`, `CANCELLED`
- `clinic.MedicalRecord`
  - one-to-one with `Appointment`
  - stores diagnosis, treatment plan, prescriptions and follow-up details

Relationship summary:

- One `Patient` -> many `Appointment`
- One doctor (`User` with role `DOCTOR`) -> many `Appointment`
- One `Appointment` -> zero or one `MedicalRecord`

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

- `--password`: sets the password used for all seeded users
- `--reset`: deletes previously seeded users/patients/appointments and recreates them
