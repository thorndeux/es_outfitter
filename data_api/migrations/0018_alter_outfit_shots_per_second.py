# Generated by Django 3.2.9 on 2021-12-06 12:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_api', '0017_auto_20211206_1158'),
    ]

    operations = [
        migrations.AlterField(
            model_name='outfit',
            name='shots_per_second',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5),
        ),
    ]
