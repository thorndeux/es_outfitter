# Generated by Django 3.2.9 on 2022-01-16 12:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_api', '0027_auto_20220116_1200'),
    ]

    operations = [
        migrations.AlterField(
            model_name='outfit',
            name='hull_energy',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5),
        ),
        migrations.AlterField(
            model_name='outfit',
            name='hull_heat',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5),
        ),
        migrations.AlterField(
            model_name='outfit',
            name='hull_repair_rate',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=6),
        ),
        migrations.AlterField(
            model_name='outfit',
            name='shield_generation',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=8),
        ),
    ]