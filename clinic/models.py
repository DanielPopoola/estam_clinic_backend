from django.conf import settings
from django.db import models


class Patient(models.Model):
	first_name = models.CharField(max_length=100)
	last_name = models.CharField(max_length=100)
	matric_number = models.CharField(max_length=50, unique=True)
	date_of_birth = models.DateField()
	phone_number = models.CharField(max_length=20)
	email = models.EmailField(blank=True)
	address = models.TextField(blank=True)
	emergency_contact_name = models.CharField(max_length=255, blank=True)
	emergency_contact_phone = models.CharField(max_length=20, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['last_name', 'first_name']

	def __str__(self) -> str:
		return f'{self.last_name}, {self.first_name}'


class AppointmentStatus(models.TextChoices):
	SCHEDULED = 'SCHEDULED', 'Scheduled'
	COMPLETED = 'COMPLETED', 'Completed'
	CANCELLED = 'CANCELLED', 'Cancelled'


class Appointment(models.Model):
	patient = models.ForeignKey(
		Patient,
		on_delete=models.CASCADE,
		related_name='appointments',
	)
	doctor = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.PROTECT,
		related_name='doctor_appointments',
		limit_choices_to={'role': 'DOCTOR'},
	)
	scheduled_at = models.DateTimeField()
	status = models.CharField(
		max_length=20,
		choices=AppointmentStatus.choices,
		default=AppointmentStatus.SCHEDULED,
	)
	reason = models.TextField(blank=True)
	notes = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-scheduled_at']

	def __str__(self) -> str:
		return f'{self.patient} with {self.doctor} on {self.scheduled_at:%Y-%m-%d %H:%M}'


class MedicalRecord(models.Model):
	appointment = models.OneToOneField(
		Appointment,
		on_delete=models.CASCADE,
		related_name='medical_record',
	)
	diagnosis = models.TextField()
	treatment_plan = models.TextField(blank=True)
	prescriptions = models.TextField(blank=True)
	follow_up_instructions = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self) -> str:
		return f'Medical Record for Appointment #{self.appointment_id}'
