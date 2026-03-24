from django.test import TestCase
from rest_framework.test import APIRequestFactory

from accounts.models import User, UserRole
from accounts.permissions import IsReceptionist


class AccountsPermissionsTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    def test_is_receptionist_allows_authenticated_receptionist(self):
        receptionist = User.objects.create_user(
            username='reception',
            email='reception@example.com',
            password='StrongPass123!',
            role=UserRole.RECEPTIONIST,
        )
        request = self.factory.get('/')
        request.user = receptionist

        self.assertTrue(IsReceptionist().has_permission(request, view=None))
