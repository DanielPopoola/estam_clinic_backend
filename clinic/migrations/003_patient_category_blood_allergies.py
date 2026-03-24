from django.db import migrations, models


class Migration(migrations.Migration):
	dependencies = [
		('clinic', '0002_patient_matric_number'),
	]

	operations = [
		migrations.AddField(
			model_name='patient',
			name='category',
			field=models.CharField(
				choices=[('STUDENT', 'Student'), ('STAFF', 'Staff')],
				default='STUDENT',
				max_length=10,
			),
		),
		migrations.AddField(
			model_name='patient',
			name='blood_group',
			field=models.CharField(blank=True, max_length=5),
		),
		migrations.AddField(
			model_name='patient',
			name='allergies',
			field=models.TextField(
				blank=True, help_text='Comma-separated list of known allergies'
			),
		),
	]