# Generated by Django 2.2.12 on 2021-08-22 16:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_api', '0009_auto_20210822_1508'),
    ]

    operations = [
        migrations.AlterField(
            model_name='outfit',
            name='ammo',
            field=models.CharField(blank=True, max_length=40),
        ),
    ]