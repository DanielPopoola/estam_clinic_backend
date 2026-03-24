from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Appointment, MedicalRecord, Patient

User = get_user_model()


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_details = UserSerializer(source="doctor", read_only=True)
    patient_details = PatientSerializer(source="patient", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "doctor",
            "scheduled_at",
            "status",
            "reason",
            "notes",
            "created_at",
            "updated_at",
            "doctor_details",
            "patient_details",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class MedicalRecordSerializer(serializers.ModelSerializer):
    appointment_details = AppointmentSerializer(source="appointment", read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            "id",
            "appointment",
            "diagnosis",
            "treatment_plan",
            "prescriptions",
            "follow_up_instructions",
            "created_at",
            "updated_at",
            "appointment_details",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
