from datetime import timedelta

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from accounts.models import User, UserRole
from clinic.models import Appointment, AppointmentStatus, Patient
from clinic.services import create_appointment


class AppointmentServiceTests(TestCase):
	def test_prevent_double_booking_edge_case(self):
		doctor = User.objects.create_user(
			username='doc4', email='doc4@example.com', password='StrongPass123!', role=UserRole.DOCTOR
		)
		patient_1 = Patient.objects.create(
			first_name='One',
			last_name='Patient',
			matric_number='MAT-50001',
			date_of_birth='1990-01-01',
			phone_number='+12025550011',
		)
		patient_2 = Patient.objects.create(
			first_name='Two',
			last_name='Patient',
			matric_number='MAT-50002',
			date_of_birth='1992-01-01',
			phone_number='+12025550012',
		)

		conflict_time = timezone.now() + timedelta(days=1)
		Appointment.objects.create(
			doctor=doctor,
			patient=patient_1,
			scheduled_at=conflict_time,
			status=AppointmentStatus.SCHEDULED,
		)

		with self.assertRaises(ValidationError) as error_info:
			create_appointment(
				patient=patient_2,
				doctor=doctor,
				scheduled_at=conflict_time,
				status=AppointmentStatus.SCHEDULED,
				reason='Routine checkup',
			)

		self.assertIn('already booked', str(error_info.exception).lower())

	def test_reject_booking_in_the_past(self):
		doctor = User.objects.create_user(
			username='doc5', email='doc5@example.com', password='StrongPass123!', role=UserRole.DOCTOR
		)
		patient = Patient.objects.create(
			first_name='Past',
			last_name='Patient',
			matric_number='MAT-50003',
			date_of_birth='1988-01-01',
			phone_number='+12025550013',
		)

		with self.assertRaises(ValidationError) as error_info:
			create_appointment(
				patient=patient,
				doctor=doctor,
				scheduled_at=timezone.now() - timedelta(hours=1),
				status=AppointmentStatus.SCHEDULED,
			)

		self.assertIn('past', str(error_info.exception).lower())

	def test_reject_non_doctor_assignment(self):
		receptionist = User.objects.create_user(
			username='rec1',
			email='rec1@example.com',
			password='StrongPass123!',
			role=UserRole.RECEPTIONIST,
		)
		patient = Patient.objects.create(
			first_name='Role',
			last_name='Mismatch',
			matric_number='MAT-50004',
			date_of_birth='1993-01-01',
			phone_number='+12025550014',
		)

		with self.assertRaises(ValidationError) as error_info:
			create_appointment(
				patient=patient,
				doctor=receptionist,
				scheduled_at=timezone.now() + timedelta(days=1),
				status=AppointmentStatus.SCHEDULED,
			)

		self.assertIn('doctor role', str(error_info.exception).lower())
