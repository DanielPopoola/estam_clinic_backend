from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from accounts.models import User, UserRole
from clinic.models import Appointment, AppointmentStatus, MedicalRecord, Patient
from clinic.selectors import (
    get_appointments_for_doctor,
    get_medical_record_for_appointment,
    is_doctor_double_booked,
)


class ClinicSelectorTests(TestCase):
    def setUp(self):
        self.doctor = User.objects.create_user(
            username='selector-doc',
            email='selector-doc@example.com',
            password='StrongPass123!',
            role=UserRole.DOCTOR,
        )
        self.patient = Patient.objects.create(
            first_name='Sel',
            last_name='Patient',
            matric_number='MAT-SEL-1',
            date_of_birth='1990-01-01',
            phone_number='+12025550222',
        )

    def test_get_appointments_for_doctor_returns_queryset(self):
        appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=AppointmentStatus.SCHEDULED,
        )

        queryset = get_appointments_for_doctor(self.doctor)

        self.assertIn(appointment, queryset)

    def test_is_doctor_double_booked_respects_excluded_appointment_id(self):
        scheduled_at = timezone.now() + timedelta(days=2)
        appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            scheduled_at=scheduled_at,
            status=AppointmentStatus.SCHEDULED,
        )

        self.assertTrue(is_doctor_double_booked(self.doctor, scheduled_at))
        self.assertFalse(
            is_doctor_double_booked(
                self.doctor,
                scheduled_at,
                exclude_appointment_id=appointment.id,
            )
        )

    def test_get_medical_record_for_appointment_returns_first_match(self):
        appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            scheduled_at=timezone.now() + timedelta(days=3),
            status=AppointmentStatus.SCHEDULED,
        )
        record = MedicalRecord.objects.create(appointment=appointment, diagnosis='Diagnosis')

        self.assertEqual(get_medical_record_for_appointment(appointment), record)
