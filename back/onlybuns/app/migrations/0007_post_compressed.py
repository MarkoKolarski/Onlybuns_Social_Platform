# Generated by Django 5.1.2 on 2024-11-10 22:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0006_alter_post_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='compressed',
            field=models.BooleanField(default=False),
        ),
    ]
