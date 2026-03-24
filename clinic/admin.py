from django.contrib import admin

from .models import Appointment, MedicalRecord, Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("id", "first_name", "last_name", "date_of_birth", "phone_number")
    search_fields = ("first_name", "last_name", "phone_number", "email")


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "doctor", "scheduled_at", "status")
    list_filter = ("status", "scheduled_at")
    search_fields = (
        "patient__first_name",
        "patient__last_name",
        "doctor__username",
        "doctor__first_name",
        "doctor__last_name",
    )


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ("id", "appointment", "created_at", "updated_at")
    search_fields = ("appointment__patient__first_name", "appointment__patient__last_name")
