# Generated by Django 5.1.2 on 2024-11-05 17:37

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='comment',
            old_name='creation_date',
            new_name='created_at',
        ),
        migrations.RemoveField(
            model_name='comment',
            name='like_count',
        ),
        migrations.RemoveField(
            model_name='post',
            name='comment_count',
        ),
        migrations.RemoveField(
            model_name='post',
            name='creation_date',
        ),
        migrations.RemoveField(
            model_name='post',
            name='image_path',
        ),
        migrations.RemoveField(
            model_name='post',
            name='location',
        ),
        migrations.AddField(
            model_name='post',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to=''),
        ),
        migrations.AlterField(
            model_name='comment',
            name='text',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name='Like',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='likes', to='app.post')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
