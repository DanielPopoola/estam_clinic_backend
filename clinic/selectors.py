from django.contrib.auth import get_user_model

from .models import Appointment, AppointmentStatus, MedicalRecord

User = get_user_model()


def get_appointments_for_doctor(doctor_user: User):
    return Appointment.objects.filter(doctor=doctor_user).select_related("patient", "doctor")


def is_doctor_double_booked(doctor_user: User, scheduled_at, *, exclude_appointment_id=None) -> bool:
    queryset = Appointment.objects.filter(
        doctor=doctor_user,
        scheduled_at=scheduled_at,
    ).exclude(status=AppointmentStatus.CANCELLED)

    if exclude_appointment_id is not None:
        queryset = queryset.exclude(id=exclude_appointment_id)

    return queryset.exists()


def get_medical_record_for_appointment(appointment):
    return MedicalRecord.objects.filter(appointment=appointment).first()
