# Generated by Django 3.2.9 on 2022-01-16 11:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_api', '0025_alter_outfit_thrust'),
    ]

    operations = [
        migrations.AlterField(
            model_name='outfit',
            name='thrusting_energy',
            field=models.DecimalField(decimal_places=3, default=0, max_digits=8),
        ),
        migrations.AlterField(
            model_name='outfit',
            name='thrusting_heat',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=8),
        ),
    ]
