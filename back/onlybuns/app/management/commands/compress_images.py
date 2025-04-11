import os
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from app.models import Post
from PIL import Image

class Command(BaseCommand):
    help = 'Compress images for every post'

    def handle(self, *args, **kwargs):


        #one_month_ago = timezone.now() - timedelta(days=30)
        #posts = Post.objects.filter(created_at__lt=one_month_ago)

        # Dobijanje svih postova koji imaju slike
        posts = Post.objects.all()

        # Kreiranje direktorijuma za kompresovane slike ako ne postoji
        compressed_dir = os.path.join(settings.MEDIA_ROOT, 'compressed')
        if not os.path.exists(compressed_dir):
            os.makedirs(compressed_dir)
            self.stdout.write(self.style.SUCCESS(f'Created directory: {compressed_dir}'))

        for post in posts:
            if post.image:
                image_path = os.path.join(settings.MEDIA_ROOT, post.image.name)
                compressed_image_path = os.path.join(compressed_dir, post.image.name)

                # Proveri da li je slika već kompresovana
                if not os.path.exists(compressed_image_path):
                    try:
                        self.compress_image(image_path, compressed_image_path)

                        post.compressed = True
                        post.save()
                        
                        self.stdout.write(self.style.SUCCESS(f'Compressed image for post {post.id}'))
                    except FileNotFoundError:
                        # Ako slika nije pronađena, preskoči je
                        self.stdout.write(self.style.WARNING(f'Image not found for post {post.id}, skipping.'))
                    except Exception as e:
                        # Ako dođe do bilo kakve druge greške, preskoči je
                        self.stdout.write(self.style.ERROR(f'Error processing image for post {post.id}: {e}'))

    def compress_image(self, image_path, compressed_image_path):
        # Kompresija slike
        with Image.open(image_path) as img:
            img.save(compressed_image_path, optimize=True, quality=1)
            self.stdout.write(self.style.SUCCESS(f'Image compressed and saved to {compressed_image_path}'))
