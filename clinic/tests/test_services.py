from datetime import timedelta

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from accounts.models import User, UserRole
from clinic.models import Appointment, AppointmentStatus, MedicalRecord, Patient
from clinic.services import (
    create_appointment,
    create_medical_record,
    update_appointment,
    update_medical_record,
)


class AppointmentServiceTests(TestCase):
    def setUp(self):
        self.doctor = User.objects.create_user(
            username='doc4', email='doc4@example.com', password='StrongPass123!', role=UserRole.DOCTOR
        )
        self.patient_1 = Patient.objects.create(
            first_name='One',
            last_name='Patient',
            matric_number='MAT-50001',
            date_of_birth='1990-01-01',
            phone_number='+12025550011',
        )
        self.patient_2 = Patient.objects.create(
            first_name='Two',
            last_name='Patient',
            matric_number='MAT-50002',
            date_of_birth='1992-01-01',
            phone_number='+12025550012',
        )

    def test_prevent_double_booking_edge_case(self):
        conflict_time = timezone.now() + timedelta(days=1)
        Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient_1,
            scheduled_at=conflict_time,
            status=AppointmentStatus.SCHEDULED,
        )

        with self.assertRaises(ValidationError) as error_info:
            create_appointment(
                patient=self.patient_2,
                doctor=self.doctor,
                scheduled_at=conflict_time,
                status=AppointmentStatus.SCHEDULED,
                reason='Routine checkup',
            )

        self.assertIn('already booked', str(error_info.exception).lower())

    def test_reject_booking_in_the_past(self):
        with self.assertRaises(ValidationError) as error_info:
            create_appointment(
                patient=self.patient_1,
                doctor=self.doctor,
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

        with self.assertRaises(ValidationError) as error_info:
            create_appointment(
                patient=self.patient_1,
                doctor=receptionist,
                scheduled_at=timezone.now() + timedelta(days=1),
                status=AppointmentStatus.SCHEDULED,
            )

        self.assertIn('doctor role', str(error_info.exception).lower())

    def test_update_appointment_success(self):
        appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient_1,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=AppointmentStatus.SCHEDULED,
            reason='Initial',
        )

        updated = update_appointment(
            appointment=appointment,
            status=AppointmentStatus.COMPLETED,
            reason='Updated reason',
        )

        self.assertEqual(updated.status, AppointmentStatus.COMPLETED)
        self.assertEqual(updated.reason, 'Updated reason')

    def test_update_appointment_rejects_non_doctor(self):
        appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient_1,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=AppointmentStatus.SCHEDULED,
        )
        receptionist = User.objects.create_user(
            username='rec2',
            email='rec2@example.com',
            password='StrongPass123!',
            role=UserRole.RECEPTIONIST,
        )

        with self.assertRaises(ValidationError):
            update_appointment(appointment=appointment, doctor=receptionist)

    def test_update_appointment_rejects_double_booked_slot(self):
        target_time = timezone.now() + timedelta(days=3)
        appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient_1,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=AppointmentStatus.SCHEDULED,
        )
        Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient_2,
            scheduled_at=target_time,
            status=AppointmentStatus.SCHEDULED,
        )

        with self.assertRaises(ValidationError):
            update_appointment(appointment=appointment, scheduled_at=target_time)


class MedicalRecordServiceTests(TestCase):
    def setUp(self):
        self.doctor = User.objects.create_user(
            username='doc6', email='doc6@example.com', password='StrongPass123!', role=UserRole.DOCTOR
        )
        self.receptionist = User.objects.create_user(
            username='rec6',
            email='rec6@example.com',
            password='StrongPass123!',
            role=UserRole.RECEPTIONIST,
        )
        self.patient = Patient.objects.create(
            first_name='Rec',
            last_name='Patient',
            matric_number='MAT-60001',
            date_of_birth='1994-01-01',
            phone_number='+12025550021',
        )
        self.appointment = Appointment.objects.create(
            doctor=self.doctor,
            patient=self.patient,
            scheduled_at=timezone.now() + timedelta(days=1),
            status=AppointmentStatus.SCHEDULED,
        )

    def test_create_medical_record_receptionist_cannot_set_prescriptions(self):
        with self.assertRaises(ValidationError):
            create_medical_record(
                acting_user=self.receptionist,
                appointment=self.appointment,
                diagnosis='Diagnosis',
                prescriptions='Forbidden',
            )

    def test_create_medical_record_success_for_doctor(self):
        record = create_medical_record(
            acting_user=self.doctor,
            appointment=self.appointment,
            diagnosis='Diagnosis',
            prescriptions='Allowed',
        )

        self.assertEqual(record.prescriptions, 'Allowed')

    def test_update_medical_record_receptionist_cannot_set_prescriptions(self):
        record = MedicalRecord.objects.create(appointment=self.appointment, diagnosis='A')

        with self.assertRaises(ValidationError):
            update_medical_record(
                acting_user=self.receptionist,
                medical_record=record,
                prescriptions='Not allowed',
            )

    def test_update_medical_record_success(self):
        record = MedicalRecord.objects.create(appointment=self.appointment, diagnosis='A')

        updated = update_medical_record(
            acting_user=self.doctor,
            medical_record=record,
            diagnosis='Updated diagnosis',
            treatment_plan='Plan',
        )

        self.assertEqual(updated.diagnosis, 'Updated diagnosis')
        self.assertEqual(updated.treatment_plan, 'Plan')
