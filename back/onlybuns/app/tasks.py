import calendar
from datetime import datetime
from background_task import background  
from django.core.management import call_command
from django.utils.timezone import now, timedelta
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.db import models
from django.conf import settings

@background(schedule=60 * 60 * 24)
def delete_inactive_users_task():
    today = datetime.now().date()
    _, last_day = calendar.monthrange(today.year, today.month)

    if today.day == last_day:
        call_command('delete_inactive_users')

@background(schedule=8)  # Pokreće se svakih 8 sekundi za testiranje
def send_notifications_to_inactive_users():
    seven_days_ago = now() - timedelta(days=7)
    User = get_user_model()

    # Dohvatanje korisnika koji nisu pristupili aplikaciji u poslednjih 7 dana
    inactive_users = User.objects.filter(last_login__lt=seven_days_ago) | User.objects.filter(last_login__isnull=True)

    if not inactive_users.exists():
        print("Nema neaktivnih korisnika za slanje obaveštenja.")
        return

    for user in inactive_users:
        # Generisanje statistike
        followers_count = (
            user.verified_user.followers.count() if hasattr(user, "verified_user") else 0
        )
        new_posts_count = user.post_set.filter(created_at__gte=seven_days_ago).count()
        likes_received_count = user.post_set.filter(
            created_at__gte=seven_days_ago
        ).aggregate(total_likes=models.Sum("like_count"))["total_likes"] or 0

        # Kreiranje sadržaja email-a
        message = (
            f"Zdravo {user.username},\n\n"
            "Niste bili aktivni poslednjih 7 dana. Evo pregleda statistike:\n"
            f"- Novi pratioci: {followers_count}\n"
            f"- Nove objave: {new_posts_count}\n"
            f"- Novi lajkovi: {likes_received_count}\n\n"
            "Prijavite se i proverite šta je novo!"
        )
        subject = "Vaša nedeljna statistika"

        try:
            send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email])
            print(f"Email je uspešno poslat korisniku {user.email}.")
        except Exception as e:
            print(f"Greška pri slanju email-a korisniku {user.email}: {e}")

#! OVO JE ZA TEST
# @background(schedule=8)
# def send_notifications_to_inactive_users():
#     target_email = "markobecej1@gmail.com"
#     seven_days_ago = now() - timedelta(days=7)

#     # Dohvatanje korisnika sa specificiranim email-om
#     user = get_user_model().objects.filter(email=target_email).first()

#     if not user:
#         print(f"Korisnik sa emailom '{target_email}' ne postoji.")
#         return

#     # Provera da li je korisnik neaktivan
#     #if user.last_login is None or user.last_login < seven_days_ago:
#     if 1 == 1:
#         # Generisanje statistike
#         followers_count = (
#             user.verified_user.followers.count() if hasattr(user, "verified_user") else 0
#         )
#         new_posts_count = user.post_set.filter(created_at__gte=seven_days_ago).count()
#         likes_received_count = user.post_set.filter(
#             created_at__gte=seven_days_ago
#         ).aggregate(total_likes=models.Sum("like_count"))["total_likes"] or 0

#         # Kreiranje sadržaja email-a
#         message = (
#             f"Zdravo {user.username},\n\n"
#             "Niste bili aktivni poslednjih 7 dana. Evo pregleda statistike:\n"
#             f"- Novi pratioci: {followers_count}\n"
#             f"- Nove objave: {new_posts_count}\n"
#             f"- Novi lajkovi: {likes_received_count}\n\n"
#             "Prijavite se i proverite šta je novo!"
#         )
#         subject="Vaša nedeljna statistika"

#         try:

#             send_mail(subject , message, settings.EMAIL_HOST_USER, [user.email])

#             print(f"Email je uspešno poslat korisniku {user.email}.")
#             print(f"Detalji:\n{message}")
#         except Exception as e:
#             # Prikaz greške ukoliko slanje nije uspelo
#             print(f"Greška pri slanju email-a korisniku {user.email}: {e}")
#     #else:
#         #print(f"Korisnik {user.email} je aktivan.")


@background(schedule=86400)  # Ponovno pokretanje svakih 24 sata (86400 sekundi)
def compress_images_task():
    call_command('compress_images')  # Pokreće komandu za kompresiju slika