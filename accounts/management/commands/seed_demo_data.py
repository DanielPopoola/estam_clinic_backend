from __future__ import annotations

from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import UserRole
from clinic.models import Appointment, AppointmentStatus, MedicalRecord, Patient, PatientCategory


class Command(BaseCommand):
	help = 'Seed demo users, roles, patients, appointments, and medical records (idempotent).'

	def add_arguments(self, parser):
		parser.add_argument(
			'--password',
			default='DemoPass123!',
			help='Password used for all seeded users (default: DemoPass123!).',
		)
		parser.add_argument(
			'--reset',
			action='store_true',
			help='Delete existing seeded rows and recreate them.',
		)

	@transaction.atomic
	def handle(self, *args, **options):
		password = options['password']
		reset = options['reset']
		user_model = get_user_model()

		users_seed = [
			{
				'username': 'admin_demo',
				'email': 'admin.demo@estamclinic.test',
				'first_name': 'System',
				'last_name': 'Admin',
				'role': UserRole.ADMIN,
				'is_staff': True,
				'is_superuser': True,
			},
			{
				'username': 'dr_grace',
				'email': 'grace.doctor@estamclinic.test',
				'first_name': 'Grace',
				'last_name': 'Okafor',
				'role': UserRole.DOCTOR,
				'is_staff': True,
				'is_superuser': False,
			},
			{
				'username': 'dr_ella',
				'email': 'ella.doctor@estamclinic.test',
				'first_name': 'Ella',
				'last_name': 'Musa',
				'role': UserRole.DOCTOR,
				'is_staff': True,
				'is_superuser': False,
			},
			{
				'username': 'reception_demo',
				'email': 'frontdesk@estamclinic.test',
				'first_name': 'Mary',
				'last_name': 'Akin',
				'role': UserRole.RECEPTIONIST,
				'is_staff': True,
				'is_superuser': False,
			},
		]

		patient_seed = [
			{
				'matric_number': 'EST/STU/0001',
				'first_name': 'Aisha',
				'last_name': 'Bello',
				'date_of_birth': date(2003, 5, 14),
				'phone_number': '+234800000001',
				'email': 'aisha.bello@student.test',
				'address': 'Hall C, Estam University',
				'category': PatientCategory.STUDENT,
				'blood_group': 'O+',
				'allergies': 'Peanuts',
				'emergency_contact_name': 'Kemi Bello',
				'emergency_contact_phone': '+234811111111',
			},
			{
				'matric_number': 'EST/STF/1022',
				'first_name': 'Daniel',
				'last_name': 'Umar',
				'date_of_birth': date(1989, 9, 2),
				'phone_number': '+234800000002',
				'email': 'daniel.umar@staff.test',
				'address': 'Staff Quarters 4B',
				'category': PatientCategory.STAFF,
				'blood_group': 'A-',
				'allergies': 'None',
				'emergency_contact_name': 'Rita Umar',
				'emergency_contact_phone': '+234822222222',
			},
			{
				'matric_number': 'EST/STU/0007',
				'first_name': 'Tobi',
				'last_name': 'Eze',
				'date_of_birth': date(2001, 12, 20),
				'phone_number': '+234800000003',
				'email': 'tobi.eze@student.test',
				'address': 'Off-campus, Eastern Gate',
				'category': PatientCategory.STUDENT,
				'blood_group': 'B+',
				'allergies': 'Penicillin',
				'emergency_contact_name': 'Ngozi Eze',
				'emergency_contact_phone': '+234833333333',
			},
		]

		doctor_usernames = ['dr_grace', 'dr_ella']
		doctors = {
			user.username: user_model.objects.filter(username=user.username).first()
			for user in user_model.objects.filter(username__in=doctor_usernames)
		}

		if reset:
			seeded_matric_numbers = [p['matric_number'] for p in patient_seed]
			Appointment.objects.filter(patient__matric_number__in=seeded_matric_numbers).delete()
			Patient.objects.filter(matric_number__in=seeded_matric_numbers).delete()
			user_model.objects.filter(username__in=[u['username'] for u in users_seed]).delete()
			self.stdout.write(self.style.WARNING('Deleted existing seeded rows.'))

		created_users = 0
		updated_users = 0
		for payload in users_seed:
			username = payload['username']
			defaults = payload.copy()
			defaults.pop('username')
			user, created = user_model.objects.update_or_create(username=username, defaults=defaults)
			if created:
				created_users += 1
			else:
				updated_users += 1
			user.set_password(password)
			user.save(update_fields=['password'])
			doctors[user.username] = user if user.role == UserRole.DOCTOR else doctors.get(user.username)

		created_patients = 0
		updated_patients = 0
		for payload in patient_seed:
			matric_number = payload['matric_number']
			defaults = payload.copy()
			defaults.pop('matric_number')
			_, created = Patient.objects.update_or_create(matric_number=matric_number, defaults=defaults)
			if created:
				created_patients += 1
			else:
				updated_patients += 1

		now = timezone.now().replace(second=0, microsecond=0)
		appointment_seed = [
			{
				'patient_matric_number': 'EST/STU/0001',
				'doctor_username': 'dr_grace',
				'scheduled_at': now + timedelta(days=1),
				'status': AppointmentStatus.SCHEDULED,
				'reason': 'Frequent headaches for one week.',
				'notes': 'Monitor hydration and sleep routine.',
			},
			{
				'patient_matric_number': 'EST/STF/1022',
				'doctor_username': 'dr_ella',
				'scheduled_at': now - timedelta(days=3),
				'status': AppointmentStatus.COMPLETED,
				'reason': 'Routine blood pressure check.',
				'notes': 'Vitals stable after lifestyle changes.',
			},
		]

		created_appointments = 0
		updated_appointments = 0
		for payload in appointment_seed:
			patient = Patient.objects.get(matric_number=payload['patient_matric_number'])
			doctor = doctors[payload['doctor_username']]
			appointment, created = Appointment.objects.update_or_create(
				patient=patient,
				doctor=doctor,
				scheduled_at=payload['scheduled_at'],
				defaults={
					'status': payload['status'],
					'reason': payload['reason'],
					'notes': payload['notes'],
				},
			)
			if created:
				created_appointments += 1
			else:
				updated_appointments += 1

			if appointment.status == AppointmentStatus.COMPLETED:
				MedicalRecord.objects.update_or_create(
					appointment=appointment,
					defaults={
						'diagnosis': 'Mild hypertension under control.',
						'treatment_plan': 'Continue reduced sodium diet and moderate exercise.',
						'prescriptions': 'Amlodipine 5mg once daily for 30 days.',
						'follow_up_instructions': 'Review in 4 weeks.',
					},
				)

		self.stdout.write(self.style.SUCCESS('Demo data seeding complete.'))
		self.stdout.write(
			f'Users: {created_users} created, {updated_users} updated | '
			f'Patients: {created_patients} created, {updated_patients} updated | '
			f'Appointments: {created_appointments} created, {updated_appointments} updated'
		)
		self.stdout.write('Seeded credentials (all users):')
		for payload in users_seed:
			self.stdout.write(f" - {payload['username']} ({payload['role']}) / password: {password}")
