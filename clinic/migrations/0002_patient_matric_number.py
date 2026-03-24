from django.db import migrations, models


class Migration(migrations.Migration):
	dependencies = [
		('clinic', '0001_initial'),
	]

	operations = [
		migrations.AddField(
			model_name='patient',
			name='matric_number',
			field=models.CharField(default='', max_length=50, unique=True),
			preserve_default=False,
		),
	]
