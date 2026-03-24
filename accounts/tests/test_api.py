from datetime import timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from accounts.models import User, UserRole
from clinic.models import Patient


class AuthenticationAndRBACAPITests(TestCase):
	def setUp(self):
		self.client = APIClient()

	def test_doctor_login_returns_access_and_refresh_tokens(self):
		password = 'StrongPass123!'
		doctor = User.objects.create_user(
			username='doc1',
			email='doc1@example.com',
			password=password,
			role=UserRole.DOCTOR,
		)

		response = self.client.post(
			reverse('token_obtain_pair'),
			{'username': doctor.username, 'password': password},
			format='json',
		)

		self.assertEqual(response.status_code, 200)
		self.assertIn('access', response.data)
		self.assertIn('refresh', response.data)

	def test_doctor_cannot_escalate_own_role_to_admin(self):
		doctor = User.objects.create_user(
			username='doc2',
			email='doc2@example.com',
			password='StrongPass123!',
			role=UserRole.DOCTOR,
		)
		self.client.force_authenticate(user=doctor)

		response = self.client.put(
			reverse('user-detail', kwargs={'pk': doctor.id}),
			{'username': doctor.username, 'email': doctor.email, 'role': UserRole.ADMIN},
			format='json',
		)

		self.assertEqual(response.status_code, 403)

	def test_expired_token_cannot_access_protected_patient_profile(self):
		doctor = User.objects.create_user(
			username='doc3',
			email='doc3@example.com',
			password='StrongPass123!',
			role=UserRole.DOCTOR,
		)
		patient = Patient.objects.create(
			first_name='A',
			last_name='B',
			matric_number='MAT-EXPIRED',
			date_of_birth='1991-01-01',
			phone_number='+12025550099',
		)

		expired_token = AccessToken.for_user(doctor)
		expired_token.set_exp(
			from_time=timezone.now() - timedelta(days=1), lifetime=timedelta(seconds=1)
		)

		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {expired_token}')
		response = self.client.get(reverse('patient-detail', kwargs={'pk': patient.id}))

		self.assertEqual(response.status_code, 401)
