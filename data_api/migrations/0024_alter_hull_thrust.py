# Generated by Django 3.2.9 on 2022-01-16 11:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_api', '0023_hull_total_hp'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hull',
            name='thrust',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=7),
        ),
    ]
