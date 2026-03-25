# Role-Based Access Control

The system has three roles. Every user is assigned exactly one role at creation time. Admins can change a user's role; users cannot change their own.

---

## Roles

| Role            | Description                                                   |
|-----------------|---------------------------------------------------------------|
| `ADMIN`         | Full system access. Manages staff accounts.                   |
| `DOCTOR`        | Clinical access. Writes and updates medical records.          |
| `RECEPTIONIST`  | Operational access. Registers patients and books appointments. |

---

## Permission Matrix

| Action                             | Admin | Doctor | Receptionist |
|------------------------------------|:-----:|:------:|:------------:|
| **Users**                          |       |        |              |
| List / create / edit / delete users | ✅   | ❌     | ❌           |
| View own profile (`/me/`)          | ✅    | ✅     | ✅           |
| List active doctors                | ✅    | ✅     | ✅           |
| **Patients**                       |       |        |              |
| List / search patients             | ✅    | ✅     | ✅           |
| Create / edit / delete patients    | ✅    | ✅     | ✅           |
| **Appointments**                   |       |        |              |
| List / view appointments           | ✅    | ✅     | ✅           |
| Create appointments                | ✅    | ✅     | ✅           |
| Update appointment status          | ✅    | ✅     | ✅           |
| Delete appointments                | ✅    | ✅     | ✅           |
| **Medical Records**                |       |        |              |
| View medical records               | ✅    | ✅     | ✅           |
| Create / update medical records    | ✅    | ✅     | ❌           |
| Write prescriptions field          | ✅    | ✅     | ❌           |
| **Dashboard**                      |       |        |              |
| View dashboard stats               | ✅    | ✅     | ✅           |

---

## How It Works

Permissions are enforced in two places:

**1. DRF Permission Classes (view-level)**

Custom permission classes in `accounts/permissions.py` check `request.user.role` before the view handler runs:

```python
class IsDoctor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.DOCTOR
```

`MedicalRecordViewSet` uses `[IsAuthenticated, IsDoctor]`, which blocks receptionists at the HTTP layer and returns `403 Forbidden`.

**2. Service Layer (business-rule level)**

Some rules are more granular than view-level blocking. For example, a receptionist can *view* a medical record, but cannot set the `prescriptions` field when updating one. This is enforced inside the service function:

```python
def update_medical_record(*, acting_user, medical_record, **data):
    if acting_user.role == UserRole.RECEPTIONIST and data.get('prescriptions'):
        raise ValidationError('Receptionists cannot write medical prescriptions.')
    ...
```

**3. JWT Expiry**

Expired tokens return `401 Unauthorized`. The frontend automatically attempts a silent token refresh; if that also fails, the user is redirected to the login page.

---

## Changing a User's Role

Only an `ADMIN` user can update another user's `role` field:

```
PATCH /api/accounts/users/{id}/
Authorization: Bearer <admin-token>

{ "role": "DOCTOR" }
```

A non-admin attempting this receives `403 Forbidden`.