# Generated by Django 2.2.12 on 2021-08-21 17:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_api', '0005_auto_20210820_1145'),
    ]

    operations = [
        migrations.AddField(
            model_name='outfit',
            name='atmosphere_scan',
            field=models.IntegerField(default=0),
        ),
    ]
