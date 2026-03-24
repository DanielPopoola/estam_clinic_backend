from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from accounts.models import User, UserRole
from clinic.models import Appointment, MedicalRecord, Patient


class ClinicModelTests(TestCase):
    def setUp(self):
        self.doctor = User.objects.create_user(
            username='clinic-model-doc',
            email='clinic-model-doc@example.com',
            password='StrongPass123!',
            role=UserRole.DOCTOR,
        )
        self.patient = Patient.objects.create(
            first_name='Jane',
            last_name='Doe',
            matric_number='MAT-MODEL-1',
            date_of_birth='1990-01-01',
            phone_number='+12025550111',
        )

    def test_patient_string_representation(self):
        self.assertEqual(str(self.patient), 'Doe, Jane')

    def test_appointment_string_representation(self):
        scheduled_at = timezone.now() + timedelta(days=1)
        appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            scheduled_at=scheduled_at,
        )

        expected = f'Doe, Jane with clinic-model-doc (DOCTOR) on {scheduled_at:%Y-%m-%d %H:%M}'
        self.assertEqual(str(appointment), expected)

    def test_medical_record_string_representation(self):
        appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            scheduled_at=timezone.now() + timedelta(days=1),
        )
        record = MedicalRecord.objects.create(appointment=appointment, diagnosis='Flu')

        self.assertEqual(str(record), f'Medical Record for Appointment #{appointment.id}')
