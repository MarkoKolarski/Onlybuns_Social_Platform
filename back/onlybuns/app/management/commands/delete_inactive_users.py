from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Delete inactive users'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        inactive_users = User.objects.filter(is_active=False)
        deleted_count = inactive_users.count()
        inactive_users.delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {deleted_count} inactive users.'))
