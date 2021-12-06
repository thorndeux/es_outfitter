# Generated by Django 3.2.9 on 2021-12-06 12:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_api', '0019_auto_20211206_1239'),
    ]

    operations = [
        migrations.AddField(
            model_name='outfit',
            name='energy_per_second',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=8),
        ),
        migrations.AddField(
            model_name='outfit',
            name='fuel_per_second',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=8),
        ),
        migrations.AddField(
            model_name='outfit',
            name='heat_per_second',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=8),
        ),
    ]
