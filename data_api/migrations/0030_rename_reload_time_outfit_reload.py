# Generated by Django 3.2.9 on 2022-01-17 19:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('data_api', '0029_auto_20220117_1908'),
    ]

    operations = [
        migrations.RenameField(
            model_name='outfit',
            old_name='reload_time',
            new_name='reload',
        ),
    ]
