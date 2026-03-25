# Development Guide

This guide covers the conventions, patterns, and workflows used when working on this codebase.

---

## Table of Contents

- [Code Style](#code-style)
- [Backend Conventions](#backend-conventions)
  - [Adding a New Feature](#adding-a-new-feature)
  - [Writing Services](#writing-services)
  - [Writing Selectors](#writing-selectors)
  - [Writing Tests](#writing-tests)
- [Frontend Conventions](#frontend-conventions)
  - [Adding a New Page](#adding-a-new-page)
  - [Adding a New API Call](#adding-a-new-api-call)
- [Database Migrations](#database-migrations)
- [Pre-commit Hooks](#pre-commit-hooks)

---

## Code Style

**Backend** — enforced by [Ruff](https://docs.astral.sh/ruff/):

```bash
# Check
ruff check .

# Fix automatically
ruff check . --fix

# Format
ruff format .
```

Configuration lives in `pyproject.toml`. Key rules: single quotes, tab indentation, line length 105.

**Frontend** — TypeScript strict mode. Tailwind utility classes only (no custom CSS except `theme.css`).

---

## Backend Conventions

### Adding a New Feature

Follow this sequence:

1. Add or update the model in `models.py` and create a migration.
2. Add the serializer in `serializers.py`.
3. Add read queries as functions in `selectors.py`.
4. Add write operations with business rules as functions in `services.py`.
5. Add the view (usually a `ModelViewSet`) in `views.py`, delegating to services.
6. Register the URL in `urls.py`.
7. Write tests covering the model, serializer, service, and API layers.

### Writing Services

Services are plain Python functions, not methods on models or views. They accept only keyword arguments (`*` separator) and raise `django.core.exceptions.ValidationError` for business rule violations.

```python
# clinic/services.py

def create_something(*, user, related_object, field_a, field_b=''):
    if not some_business_rule(user):
        raise ValidationError('Reason this is invalid.')

    return Something.objects.create(
        user=user,
        related_object=related_object,
        field_a=field_a,
        field_b=field_b,
    )
```

Views catch `ValidationError` and convert it:

```python
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import exceptions

def perform_create(self, serializer):
    try:
        serializer.instance = create_something(**serializer.validated_data)
    except DjangoValidationError as exc:
        raise exceptions.ValidationError(exc.message) from exc
```

### Writing Selectors

Selectors are also plain functions. They return querysets or single objects. They never raise; callers decide what to do with an empty result.

```python
# clinic/selectors.py

def get_something_for_user(user):
    return Something.objects.filter(user=user).select_related('related')
```

### Writing Tests

The project uses `pytest-django`. Tests are split by layer:

| File                        | What it tests                                   |
|-----------------------------|-------------------------------------------------|
| `tests/test_models.py`      | Model `__str__`, constraints, defaults          |
| `tests/test_serializers.py` | Validation logic, create/update behaviour       |
| `tests/test_services.py`    | Business rules — no HTTP needed                 |
| `tests/test_selectors.py`   | Query correctness                               |
| `tests/test_api.py`         | End-to-end HTTP behaviour, RBAC, error codes    |
| `tests/test_permissions.py` | Permission class unit tests                     |

Use `APIClient.force_authenticate(user=...)` in API tests rather than managing tokens manually:

```python
def test_something(self):
    self.client.force_authenticate(user=self.doctor)
    response = self.client.get(reverse('some-list'))
    self.assertEqual(response.status_code, 200)
```

---

## Frontend Conventions

### Adding a New Page

1. Create the component in `frontend/src/app/pages/MyPage.tsx`.
2. Add the route in `frontend/src/app/routes.tsx` as a child of the dashboard route.
3. Add the nav item to `navItems` in `DashboardLayout.tsx` if it needs sidebar navigation.

### Adding a New API Call

1. Add the TypeScript interface to `frontend/src/lib/types.ts`.
2. Add the function(s) to the relevant domain object in `frontend/src/lib/api.ts`.

```typescript
// In api.ts
export const myResourceApi = {
  list: (params?: { page?: number }) =>
    api.get('/api/clinic/my-resource/', { params }),
  create: (data: Record<string, unknown>) =>
    api.post('/api/clinic/my-resource/', data),
};
```

Then in the component:

```typescript
const [data, setData] = useState<MyResource[]>([]);

useEffect(() => {
  myResourceApi.list().then(res => setData(res.data.results ?? []));
}, []);
```

---

## Database Migrations

```bash
# After changing a model
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Check for pending migrations (useful in CI)
python manage.py migrate --check
```

Migrations are committed to the repository. Never edit a migration that has already been applied in a shared environment — create a new one instead.

---

## Pre-commit Hooks

Pre-commit is configured for the project. Install the hooks after cloning:

```bash
pre-commit install
```

Hooks run `ruff` on every commit. To run manually across the whole codebase:

```bash
pre-commit run --all-files
```