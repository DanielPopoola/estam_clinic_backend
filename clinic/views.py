from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import exceptions
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from accounts.permissions import IsDoctor

from .models import Appointment, MedicalRecord, Patient
from .serializers import AppointmentSerializer, MedicalRecordSerializer, PatientSerializer
from .services import (
    create_appointment,
    create_medical_record,
    update_appointment,
    update_medical_record,
)


class PatientViewSet(ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]


class AppointmentViewSet(ModelViewSet):
    queryset = Appointment.objects.select_related("patient", "doctor")
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            serializer.instance = create_appointment(**serializer.validated_data)
        except DjangoValidationError as exc:
            raise exceptions.ValidationError(exc.message) from exc

    def perform_update(self, serializer):
        try:
            serializer.instance = update_appointment(
                appointment=self.get_object(),
                **serializer.validated_data,
            )
        except DjangoValidationError as exc:
            raise exceptions.ValidationError(exc.message) from exc


class MedicalRecordViewSet(ModelViewSet):
    queryset = MedicalRecord.objects.select_related("appointment", "appointment__doctor", "appointment__patient")
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated, IsDoctor]

    def perform_create(self, serializer):
        try:
            serializer.instance = create_medical_record(
                acting_user=self.request.user,
                **serializer.validated_data,
            )
        except DjangoValidationError as exc:
            raise exceptions.ValidationError(exc.message) from exc

    def perform_update(self, serializer):
        try:
            serializer.instance = update_medical_record(
                acting_user=self.request.user,
                medical_record=self.get_object(),
                **serializer.validated_data,
            )
        except DjangoValidationError as exc:
            raise exceptions.ValidationError(exc.message) from exc
