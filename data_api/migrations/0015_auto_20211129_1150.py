# Generated by Django 3.2.9 on 2021-11-29 11:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('data_api', '0014_auto_20211116_2042'),
    ]

    operations = [
        migrations.AddField(
            model_name='outfit',
            name='spinal_mounts',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='outfit',
            name='ammo',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='launcher', to='data_api.outfit'),
        ),
    ]
