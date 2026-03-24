from django.test import TestCase

from accounts.models import User, UserRole
from accounts.serializers import UserSerializer


class UserSerializerTests(TestCase):
    def test_create_with_password_hashes_password(self):
        serializer = UserSerializer(
            data={
                'username': 'serial-user-1',
                'email': 'serial-user-1@example.com',
                'password': 'StrongPass123!',
                'role': UserRole.DOCTOR,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertTrue(user.check_password('StrongPass123!'))

    def test_create_without_password_sets_unusable_password(self):
        serializer = UserSerializer(
            data={
                'username': 'serial-user-2',
                'email': 'serial-user-2@example.com',
                'role': UserRole.RECEPTIONIST,
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertFalse(user.has_usable_password())

    def test_update_without_password_updates_fields_without_changing_password(self):
        user = User.objects.create_user(
            username='serial-user-3',
            email='serial-user-3@example.com',
            password='StrongPass123!',
            role=UserRole.RECEPTIONIST,
            first_name='Old',
        )

        serializer = UserSerializer(
            user,
            data={'first_name': 'New'},
            partial=True,
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_user = serializer.save()

        self.assertEqual(updated_user.first_name, 'New')
        self.assertTrue(updated_user.check_password('StrongPass123!'))

    def test_update_with_password_rehashes_password(self):
        user = User.objects.create_user(
            username='serial-user-4',
            email='serial-user-4@example.com',
            password='StrongPass123!',
            role=UserRole.DOCTOR,
        )

        serializer = UserSerializer(
            user,
            data={'password': 'EvenStrongerPass456!'},
            partial=True,
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        updated_user = serializer.save()

        self.assertTrue(updated_user.check_password('EvenStrongerPass456!'))
