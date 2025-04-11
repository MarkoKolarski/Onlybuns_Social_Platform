from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

# Model za tipove korisnika
class User(AbstractUser):
    USER_TYPES = (
        ('unauthenticated', 'Unauthenticated'),
        ('authenticated', 'Authenticated'),
        ('admin', 'Admin'),
    )
    # Dodatna polja za User model
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='unauthenticated')
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.username

# Model za verificiranog korisnika sa dodatnim poljima
class VerifiedUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="verified_user")
    follower_count = models.IntegerField(default=0)
    post_count = models.IntegerField(default=0)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following', blank=True)

    def __str__(self):
        return f"VerifiedUser: {self.user.username}"

# Model za admin korisnika
class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="admin_profile")

    def __str__(self):
        return f"Admin: {self.user.username}"

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='', blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    like_count = models.IntegerField(default=0)
    compressed = models.BooleanField(default=False)
    deleted = models.BooleanField(default=False)

    def __str__(self):
        return f"Post by {self.user.username} at {self.created_at}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    text = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']  # Komentari sortirani od najnovijeg ka najstarijem

    def __str__(self):
        return f"Comment by {self.user.username} on {self.post.id}"

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='likes', on_delete=models.CASCADE)
