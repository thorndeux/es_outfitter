# Generated by Django 3.2.9 on 2022-01-17 19:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_api', '0028_auto_20220116_1202'),
    ]

    operations = [
        migrations.AddField(
            model_name='hull',
            name='agility_rating',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=6),
        ),
        migrations.AddField(
            model_name='hull',
            name='speed_rating',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=6),
        ),
        migrations.AddField(
            model_name='outfit',
            name='combined_cooling',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=8),
        ),
    ]
