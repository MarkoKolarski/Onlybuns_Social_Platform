from django.apps import AppConfig

class AppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app'

    def ready(self):
        from app.tasks import compress_images_task, send_notifications_to_inactive_users, delete_inactive_users_task
        send_notifications_to_inactive_users(schedule=8)
        compress_images_task(schedule=86400)
        delete_inactive_users_task(repeat=60 * 60 * 24)