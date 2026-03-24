from django.core.exceptions import ValidationError

from accounts.models import UserRole

from .models import Appointment, MedicalRecord
from .selectors import is_doctor_double_booked


def create_appointment(*, patient, doctor, scheduled_at, status, reason="", notes=""):
    if doctor.role != UserRole.DOCTOR:
        raise ValidationError("Appointments can only be assigned to users with the DOCTOR role.")

    if is_doctor_double_booked(doctor, scheduled_at):
        raise ValidationError("Doctor is already booked at the selected time.")

    return Appointment.objects.create(
        patient=patient,
        doctor=doctor,
        scheduled_at=scheduled_at,
        status=status,
        reason=reason,
        notes=notes,
    )


def update_appointment(*, appointment: Appointment, **data):
    doctor = data.get("doctor", appointment.doctor)
    scheduled_at = data.get("scheduled_at", appointment.scheduled_at)

    if doctor.role != UserRole.DOCTOR:
        raise ValidationError("Appointments can only be assigned to users with the DOCTOR role.")

    if is_doctor_double_booked(
        doctor,
        scheduled_at,
        exclude_appointment_id=appointment.id,
    ):
        raise ValidationError("Doctor is already booked at the selected time.")

    for field, value in data.items():
        setattr(appointment, field, value)
    appointment.save()
    return appointment


def create_medical_record(*, acting_user, appointment, diagnosis, treatment_plan="", prescriptions="", follow_up_instructions=""):
    if acting_user.role == UserRole.RECEPTIONIST and prescriptions:
        raise ValidationError("Receptionists cannot write medical prescriptions.")

    return MedicalRecord.objects.create(
        appointment=appointment,
        diagnosis=diagnosis,
        treatment_plan=treatment_plan,
        prescriptions=prescriptions,
        follow_up_instructions=follow_up_instructions,
    )


def update_medical_record(*, acting_user, medical_record: MedicalRecord, **data):
    if acting_user.role == UserRole.RECEPTIONIST and data.get("prescriptions"):
        raise ValidationError("Receptionists cannot write medical prescriptions.")

    for field, value in data.items():
        setattr(medical_record, field, value)
    medical_record.save()
    return medical_record
