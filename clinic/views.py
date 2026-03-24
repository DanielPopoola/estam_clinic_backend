from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import exceptions
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from accounts.permissions import IsDoctor

from .models import Appointment, AppointmentStatus, MedicalRecord, Patient
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
	filter_backends = [SearchFilter]
	search_fields = ['first_name', 'last_name', 'matric_number', 'email', 'phone_number']

	def get_queryset(self):
		qs = super().get_queryset()
		category = self.request.query_params.get('category')
		if category:
			qs = qs.filter(category=category.upper())
		return qs


class AppointmentViewSet(ModelViewSet):
	queryset = Appointment.objects.select_related('patient', 'doctor')
	serializer_class = AppointmentSerializer
	permission_classes = [IsAuthenticated]
	filter_backends = [SearchFilter]
	search_fields = [
		'patient__first_name',
		'patient__last_name',
		'patient__matric_number',
		'doctor__first_name',
		'doctor__last_name',
	]

	def get_queryset(self):
		qs = super().get_queryset()
		status = self.request.query_params.get('status')
		date = self.request.query_params.get('date')
		doctor = self.request.query_params.get('doctor')

		if status:
			qs = qs.filter(status=status.upper())
		if date:
			qs = qs.filter(scheduled_at__date=date)
		if doctor:
			qs = qs.filter(doctor_id=doctor)
		return qs

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
	queryset = MedicalRecord.objects.select_related(
		'appointment', 'appointment__doctor', 'appointment__patient'
	)
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


class DashboardStatsView(APIView):
	"""
	Returns aggregate counts for the dashboard overview cards
	and a 7-day patient visit trend for the chart.
	"""

	permission_classes = [IsAuthenticated]

	def get(self, request):
		today = timezone.now().date()

		todays_appointments = Appointment.objects.filter(
			scheduled_at__date=today
		).count()

		# Patients registered in the last 7 days
		week_ago = timezone.now() - timezone.timedelta(days=7)
		new_patients = Patient.objects.filter(created_at__gte=week_ago).count()

		# Scheduled appointments (pending / not yet completed)
		pending_appointments = Appointment.objects.filter(
			status=AppointmentStatus.SCHEDULED
		).count()

		# Daily patient visit counts for the past 7 days
		seven_days_ago = today - timezone.timedelta(days=6)
		daily_counts = (
			Appointment.objects.filter(scheduled_at__date__gte=seven_days_ago)
			.annotate(day=TruncDate('scheduled_at'))
			.values('day')
			.annotate(count=Count('id'))
			.order_by('day')
		)

		# Build a full 7-day series (fill in zeros for days with no appointments)
		counts_by_day = {item['day']: item['count'] for item in daily_counts}
		chart_data = []
		for i in range(7):
			day = seven_days_ago + timezone.timedelta(days=i)
			chart_data.append({
				'date': day.isoformat(),
				'day': day.strftime('%a'),
				'patients': counts_by_day.get(day, 0),
			})

		return Response({
			'todays_appointments': todays_appointments,
			'new_patients': new_patients,
			'pending_appointments': pending_appointments,
			'chart_data': chart_data,
		})