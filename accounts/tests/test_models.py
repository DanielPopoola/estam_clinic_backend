from django.test import TestCase

from accounts.models import User, UserRole


class UserModelTests(TestCase):
    def test_user_string_representation_includes_username_and_role(self):
        user = User.objects.create_user(
            username='model-user',
            email='model-user@example.com',
            password='StrongPass123!',
            role=UserRole.DOCTOR,
        )

        self.assertEqual(str(user), 'model-user (DOCTOR)')
