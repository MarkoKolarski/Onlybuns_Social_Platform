from threading import Thread
from django.test import TestCase
from app.models import Post, User, Like
from django.contrib.auth import get_user_model
import time
from django.db import transaction, IntegrityError
from multiprocessing import Process
from django.db.models import F
from time import sleep
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile




# python manage.py test app.tests.LikePostTestCase.test_concurrent_likes --keepdb
class LikePostTestCase(TestCase):

    def like_post(self, user, post):
        """Funkcija za lajkovanje posta sa pesimističkim zaključavanjem."""
        try:
            with transaction.atomic():  # Obezbeđujemo da operacije budu unutar transakcije
                print(f"User {user.username} is attempting to like the post.")

                # Osvežavanje objekta post iz baze, kako bi se obezbedilo da ima ispravan ID
                post.refresh_from_db()

                # Preuzimanje posta sa zaključavanjem koristeći id
                post = Post.objects.select_for_update().filter(id=post.id).first()

                if not post:
                    print(f"Post with id '{post.id}' does not exist.")
                    return

                print(f"Post {post.id} locked by {user.username}")

                # Provera da li korisnik već lajkuje post
                if Like.objects.filter(user=user, post=post).exists():
                    print(f"User {user.username} already liked the post.")
                    return

                # Kreiranje lajka
                Like.objects.create(user=user, post=post)
                post.like_count += 1
                post.save()

                # Osvežavanje posta nakon promene
                post.refresh_from_db()
                print(f"User {user.username} has liked the post. Like count is now {post.like_count}.")
        except Exception as e:
            print(f"Error occurred: {e}")

    def test_concurrent_likes(self):
        # Preuzimanje korisnika sa indeksima 1 i 2
        self.user1 = get_user_model().objects.get(id=1)
        self.user2 = get_user_model().objects.get(id=2)

        # Preuzimanje posta sa indeksom 1
        self.post = Post.objects.get(id=1)

        # Osvežavanje objekta post iz baze, kako bi se osiguralo da ima ispravan ID
        self.post.refresh_from_db()

        # Provera da li je post uspešno preuzet
        self.assertIsNotNone(self.post, "Post was not found successfully.")
        self.assertEqual(self.post.like_count, 0)  # Proverite da li početni broj lajkova je 0

        # Proverite da li je post dostupan pre konkurentnih operacija
        post_before = Post.objects.filter(id=self.post.id).exists()
        print(f"Post exists before liking: {post_before}")

        # Kreiranje dva thread-a koja pokušavaju da lajkuju isti post
        thread1 = Thread(target=self.like_post, args=(self.user1, self.post))
        thread2 = Thread(target=self.like_post, args=(self.user2, self.post))

        thread1.start()
        sleep(2)  # Dodajte kratku pauzu kako bi se osigurala konkurentnost
        thread2.start()

        thread1.join()
        thread2.join()

        # Osvežavanje posta iz baze nakon što su oba lajka izvršena
        self.post.refresh_from_db()

        # Provera da li je broj lajkova na postu ispravno ažuriran
        print(f"Final like count: {self.post.like_count}")
        self.assertEqual(self.post.like_count, 2)

        # Proverite postojanje posta nakon konkurentnih operacija
        post_after = Post.objects.filter(id=self.post.id).exists()
        print(f"Post exists after liking: {post_after}")


# poziv testa uz komandu:
# python manage.py test app.tests.ConcurrentRegistrationTest.test_concurrent_registration --keepdb
class ConcurrentRegistrationTest(TestCase):
    def register_user(self, email, username):
        user_model = get_user_model()
        try:
            with transaction.atomic():
                # Pesimističko zaključavanje reda
                user_model.objects.select_for_update().filter(username=username)

                # Provera da li korisnik već postoji
                if user_model.objects.filter(username=username).exists():
                    print(f"Username {username} already exists.")
                    return

                # Kreiranje korisnika
                user_model.objects.create_user(
                    email=email,
                    username=username,
                    password="StrongPassword123",
                    first_name="Test",
                    last_name="User",
                    location="TestLocation",
                    is_active=False
                )
        except IntegrityError:
            print(f"Conflict occurred for username: {username}")

    def test_concurrent_registration(self):
        user_model = get_user_model()

        # Kreiranje dva thread-a koja pokušavaju da registruju istog korisnika
        thread1 = Thread(target=self.register_user, args=("test1@example.com", "testuser"))
        thread2 = Thread(target=self.register_user, args=("test2@example.com", "testuser"))

        thread1.start()
        time.sleep(2)
        thread2.start()

        thread1.join()
        thread2.join()

        # Provera da li je samo jedan korisnik registrovan
        self.assertEqual(user_model.objects.filter(username="testuser").count(), 1)