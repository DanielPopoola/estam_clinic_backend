from datetime import date

from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import Appointment, MedicalRecord, Patient

User = get_user_model()


class PatientSerializer(serializers.ModelSerializer):
	class Meta:
		model = Patient
		fields = '__all__'
		read_only_fields = ['id', 'created_at', 'updated_at']

	def validate_date_of_birth(self, value):
		if value > date.today():
			raise serializers.ValidationError('Date of birth cannot be in the future.')
		return value

	def validate_phone_number(self, value):
		if len(value) > 13:
			raise serializers.ValidationError(
				'Phone number must be 13 characters or fewer.'
			)
		return value


class AppointmentSerializer(serializers.ModelSerializer):
	doctor_details = UserSerializer(source='doctor', read_only=True)
	patient_details = PatientSerializer(source='patient', read_only=True)

	class Meta:
		model = Appointment
		fields = [
			'id',
			'patient',
			'doctor',
			'scheduled_at',
			'status',
			'reason',
			'notes',
			'created_at',
			'updated_at',
			'doctor_details',
			'patient_details',
		]
		read_only_fields = ['id', 'created_at', 'updated_at']


class MedicalRecordSerializer(serializers.ModelSerializer):
	appointment_details = AppointmentSerializer(source='appointment', read_only=True)

	class Meta:
		model = MedicalRecord
		fields = [
			'id',
			'appointment',
			'diagnosis',
			'treatment_plan',
			'prescriptions',
			'follow_up_instructions',
			'created_at',
			'updated_at',
			'appointment_details',
		]
		read_only_fields = ['id', 'created_at', 'updated_at']