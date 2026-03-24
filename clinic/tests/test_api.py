from datetime import timedelta

from django.db.models import ProtectedError
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import User, UserRole
from clinic.models import Appointment, AppointmentStatus, MedicalRecord, Patient


class ClinicAPITests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.receptionist = User.objects.create_user(
			username='rec-main',
			email='rec-main@example.com',
			password='StrongPass123!',
			role=UserRole.RECEPTIONIST,
		)
		self.doctor = User.objects.create_user(
			username='doc-main',
			email='doc-main@example.com',
			password='StrongPass123!',
			role=UserRole.DOCTOR,
		)

	def create_patient(self, matric_number='MAT-10001'):
		return Patient.objects.create(
			first_name='Jane',
			last_name='Doe',
			matric_number=matric_number,
			date_of_birth='1990-05-20',
			phone_number='+12025550123',
			email='jane.doe@example.com',
		)

	def test_unauthenticated_user_cannot_access_patients_list(self):
		response = self.client.get(reverse('patient-list'))
		self.assertEqual(response.status_code, 401)

	def test_create_patient_happy_path(self):
		self.client.force_authenticate(user=self.receptionist)
		payload = {
			'first_name': 'Jane',
			'last_name': 'Doe',
			'matric_number': 'MAT-10099',
			'date_of_birth': '1990-05-20',
			'phone_number': '+12025550123',
			'email': 'jane99.doe@example.com',
		}
		response = self.client.post(reverse('patient-list'), payload, format='json')

		self.assertEqual(response.status_code, 201)
		self.assertTrue(Patient.objects.filter(matric_number='MAT-10099').exists())

	def test_create_patient_duplicate_matric_number_rejected(self):
		self.client.force_authenticate(user=self.receptionist)
		self.create_patient(matric_number='MAT-20001')

		response = self.client.post(
			reverse('patient-list'),
			{
				'first_name': 'A',
				'last_name': 'B',
				'matric_number': 'MAT-20001',
				'date_of_birth': '1999-01-01',
				'phone_number': '+12025550000',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn('matric_number', response.data)

	def test_create_patient_future_dob_rejected(self):
		self.client.force_authenticate(user=self.receptionist)
		response = self.client.post(
			reverse('patient-list'),
			{
				'first_name': 'Future',
				'last_name': 'Kid',
				'matric_number': 'MAT-30001',
				'date_of_birth': '2030-01-01',
				'phone_number': '+12025550001',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn('date_of_birth', response.data)

	def test_create_patient_long_phone_rejected(self):
		self.client.force_authenticate(user=self.receptionist)
		response = self.client.post(
			reverse('patient-list'),
			{
				'first_name': 'Long',
				'last_name': 'Phone',
				'matric_number': 'MAT-40001',
				'date_of_birth': '1995-06-10',
				'phone_number': '1' * 30,
			},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn('phone_number', response.data)

	def test_receptionist_can_book_appointment_for_tomorrow(self):
		self.client.force_authenticate(user=self.receptionist)
		patient = self.create_patient('MAT-BOOK-1')
		response = self.client.post(
			reverse('appointment-list'),
			{
				'patient': patient.id,
				'doctor': self.doctor.id,
				'scheduled_at': (timezone.now() + timedelta(days=1)).isoformat(),
				'status': AppointmentStatus.SCHEDULED,
				'reason': 'Initial consultation',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 201)

	def test_receptionist_cannot_create_medical_record(self):
		self.client.force_authenticate(user=self.receptionist)
		patient = self.create_patient('MAT-REC-1')
		appointment = Appointment.objects.create(
			doctor=self.doctor,
			patient=patient,
			scheduled_at=timezone.now() + timedelta(days=1),
		)

		response = self.client.post(
			reverse('record-list'),
			{'appointment': appointment.id, 'diagnosis': 'Diagnosis text'},
			format='json',
		)

		self.assertEqual(response.status_code, 403)

	def test_medical_record_one_to_one_violation_rejected(self):
		self.client.force_authenticate(user=self.doctor)
		patient = self.create_patient('MAT-MR-1')
		appointment = Appointment.objects.create(
			doctor=self.doctor,
			patient=patient,
			scheduled_at=timezone.now() + timedelta(days=1),
		)
		MedicalRecord.objects.create(appointment=appointment, diagnosis='Initial')

		response = self.client.post(
			reverse('record-list'),
			{'appointment': appointment.id, 'diagnosis': 'Second'},
			format='json',
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn('appointment', response.data)

	def test_deleting_doctor_is_blocked_and_records_persist(self):
		patient = self.create_patient('MAT-DEL-1')
		appointment = Appointment.objects.create(
			doctor=self.doctor,
			patient=patient,
			scheduled_at=timezone.now() + timedelta(days=1),
		)
		record = MedicalRecord.objects.create(appointment=appointment, diagnosis='Test')

		with self.assertRaises(ProtectedError):
			self.doctor.delete()

		self.assertTrue(MedicalRecord.objects.filter(id=record.id).exists())

	def test_deleting_patient_cascades_to_appointments_and_records(self):
		patient = self.create_patient('MAT-DEL-2')
		appointment = Appointment.objects.create(
			doctor=self.doctor,
			patient=patient,
			scheduled_at=timezone.now() + timedelta(days=1),
		)
		record = MedicalRecord.objects.create(appointment=appointment, diagnosis='Test')

		patient.delete()

		self.assertFalse(Appointment.objects.filter(id=appointment.id).exists())
		self.assertFalse(MedicalRecord.objects.filter(id=record.id).exists())

	def test_patients_endpoint_is_paginated(self):
		self.client.force_authenticate(user=self.receptionist)
		for i in range(105):
			Patient.objects.create(
				first_name=f'First{i}',
				last_name=f'Last{i}',
				matric_number=f'MAT-PAG-{i}',
				date_of_birth='1990-01-01',
				phone_number=f'+1202555{i:04d}',
			)

		response = self.client.get(reverse('patient-list'))
		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data['results']), 100)
		self.assertIsNotNone(response.data['next'])
		self.assertIsNone(response.data['previous'])

	def test_patient_detail_not_found_returns_404(self):
		self.client.force_authenticate(user=self.receptionist)
		response = self.client.get(reverse('patient-detail', kwargs={'pk': 99999}))
		self.assertEqual(response.status_code, 404)

	def test_malformed_json_returns_400(self):
		self.client.force_authenticate(user=self.receptionist)
		response = self.client.post(
			reverse('appointment-list'),
			'{"patient": 1, "doctor": 1,',
			content_type='application/json',
		)
		self.assertEqual(response.status_code, 400)
