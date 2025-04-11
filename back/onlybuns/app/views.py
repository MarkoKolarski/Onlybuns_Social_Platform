from datetime import datetime, timedelta, timezone
from venv import logger
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from .models import Post, Like, VerifiedUser, Comment
from .serializers import ChangePasswordSerializer, PostSerializer, RegistrationSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.generics import ListAPIView
from django.utils import timezone
from django.core.cache import cache
from rest_framework.permissions import IsAdminUser
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from .serializers import ChangePasswordSerializer
from rest_framework.pagination import PageNumberPagination
from django.db import transaction
from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Count
import pika
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from prometheus_client import Histogram, Gauge
import time
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.utils.timezone import now
from rest_framework import status
from collections import deque, defaultdict
from django.core.cache import cache
import threading
import logging
import psutil


def index(request):
    html = render_to_string("index.js", {})
    return HttpResponse(html)

class PostDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        serializer = PostSerializer(post)
        return Response(serializer.data, status=status.HTTP_200_OK)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAdminUser])
def send_post_to_agencies(request):
    if request.method == 'POST':
        # Pretpostavljamo da podaci o postu stižu iz request.body
        data = json.loads(request.body)
        post_description = data.get('description')
        post_time = data.get('time')
        username = data.get('username')

        # RabbitMQ konfiguracija
        connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
        channel = connection.channel()

        # Kreiraj exchange za fanout
        exchange_name = 'posts_fanout_exchange'
        channel.exchange_declare(exchange=exchange_name, exchange_type='fanout')

        # Kreiraj poruku
        message = {
            'description': post_description,
            'time': post_time,
            'username': username
        }
        channel.basic_publish(
            exchange=exchange_name,
            routing_key='',  # routing_key je prazan za fanout
            body=json.dumps(message),
        )

        connection.close()

        return JsonResponse({'status': 'Message sent to agencies'}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

class RateLimiter:
    def __init__(self, max_requests, time_window):
        self.max_requests = max_requests
        self.time_window = time_window  # u sekundama
        self.requests = defaultdict(deque)
        self.lock = threading.Lock()

    def is_allowed(self, user_id):
        with self.lock:
            current_time = datetime.now()
            user_requests = self.requests[user_id]
            
            # Uklanjanje istečenih vremenskih oznaka
            while user_requests and (current_time - user_requests[0]).total_seconds() > self.time_window:
                user_requests.popleft()
            
            # Provera da li je prekoračen limit
            if len(user_requests) >= self.max_requests:
                return False
            
            # Dodavanje nove vremenske oznake zahteva
            user_requests.append(current_time)
            return True

# Inicijalizacija rate limiter-a globalno
comment_rate_limiter = RateLimiter(max_requests=5, time_window=60)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request, post_id):
    try:


        if not comment_rate_limiter.is_allowed(request.user.id):
            return Response(
                {"detail": "Rate limit exceeded. Maximum 5 comments per minute allowed."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        post = Post.objects.get(id=post_id)
        text = request.data.get('text', '').strip()
        
        if not text:
            return Response(
                {"detail": "Comment text cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        comment = Comment.objects.create(user=request.user, post=post, text=text)
        
        return Response({
            "id": comment.id,
            "user": comment.user.username,
            "text": comment.text,
            "created_at": comment.created_at
        }, status=status.HTTP_201_CREATED)

    except Post.DoesNotExist:
        return Response(
            {"detail": "Post not found."},
            status=status.HTTP_404_NOT_FOUND
        )


    

class PostDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        serializer = PostSerializer(post)
        
        # Dohvatanje komentara vezanih za post
        comments = post.comments.all()  # Zahvaljujući `related_name="comments"`
        serialized_comments = [
            {"user": comment.user.username, "text": comment.text, "created_at": comment.created_at}
            for comment in comments
        ]
        
        # Kombinovanje podataka o postu sa podacima o komentarima
        response_data = serializer.data
        response_data["comments"] = serialized_comments
        
        return Response(response_data, status=status.HTTP_200_OK)



class CustomPagination(PageNumberPagination):
    page_size = 5  # Number of users per page
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_registered_users(request):
    User = get_user_model()

    # parametri za filtriranje i sortiranje
    first_name = request.query_params.get('first_name', None)
    last_name = request.query_params.get('last_name', None)
    email = request.query_params.get('email', None)
    min_post_count = request.query_params.get('min_post_count', None)
    max_post_count = request.query_params.get('max_post_count', None)
    sort_by = request.query_params.get('sort_by', None)
    sort_order = request.query_params.get('sort_order', 'asc')

    users = User.objects.all()

    # filtriranje korisnika na osnovu imena, prezimena i email-a
    if first_name:
        users = users.filter(first_name__icontains=first_name)
    if last_name:
        users = users.filter(last_name__icontains=last_name)
    if email:
        users = users.filter(email__icontains=email)

    # filtiranje na osnovu broja postova
    if min_post_count is not None and min_post_count.isdigit():
        users = users.filter(verified_user__post_count__gte=int(min_post_count))
    if max_post_count is not None and max_post_count.isdigit():
        users = users.filter(verified_user__post_count__lte=int(max_post_count))

    # Sortiranje na osnovu sort_by i sort_order
    if sort_by == 'email':
        users = users.order_by(f'{"" if sort_order == "asc" else "-"}email')
    elif sort_by == 'follower_count':
        users = users.order_by(f'{"" if sort_order == "asc" else "-"}verified_user__follower_count')

    # koristimo paginaciju 
    paginator = CustomPagination()
    paginated_users = paginator.paginate_queryset(users, request)

    # pripremimo podatke za odgovor
    data = []
    for user in paginated_users:
        verified_user = getattr(user, 'verified_user', None)
        data.append({
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "post_count": verified_user.post_count if verified_user else 0,
            "follower_count": verified_user.follower_count if verified_user else 0,
        })

    return paginator.get_paginated_response(data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_post(request, post_id):
    post = get_object_or_404(Post, id=post_id, user=request.user)  # Proveravamo da li je korisnik vlasnik posta
    serializer = PostSerializer(post, data=request.data, partial=True)  # Dozvoljavamo delimična ažuriranja
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_post(request, post_id):
    post = get_object_or_404(Post, id=post_id, user=request.user)  # Proveravamo da li je korisnik vlasnik posta
    post.delete()
    return Response({"detail": "Post deleted."}, status=status.HTTP_204_NO_CONTENT)

logger = logging.getLogger(__name__)


# Histogram trajanja HTTP zahteva za kreiranje posta
POST_CREATION_DURATION = Histogram(
    'post_creation_duration_seconds', 
    'Duration of post creation HTTP requests', 
    ['method'],  # Oznaka za metodu (POST itd.)
    buckets=[0.1, 0.5, 1, 2, 5, 10, 20, 50]  # Primeri intervala za vremensko merenje (u sekundama)
)

# Gauge za broj aktivnih korisnika koji koriste sistem
ACTIVE_USERS = Gauge('active_users_count', 'Number of active users interacting with the system')

# Gauge za praćenje iskorišćenosti CPU-a
CPU_USAGE = Gauge('cpu_usage_percent', 'Current CPU usage percentage')

# Histogram trajanja svih HTTP zahteva radi praćenja opterećenja servera
REQUEST_DURATION = Histogram(
    'django_http_request_duration_seconds',
    'Histogram for the duration of HTTP requests',
    ['method', 'endpoint'],  # Oznake za metodu (POST, GET itd.) i endpoint (URL)
    buckets=[0.1, 0.5, 1, 2, 5, 10, 20, 50]  # Primeri intervala
)

# Middleware za praćenje trajanja zahteva
class RequestDurationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        method = request.method
        endpoint = request.path
        with REQUEST_DURATION.labels(method=method, endpoint=endpoint).time():
            response = self.get_response(request)
        return response

# API view za kreiranje posta sa metrikama
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post(request):
    start_time = time.time()  # Vreme početka merenja trajanja zahteva
    
    # Praćenje iskorišćenosti CPU-a pre obrade zahteva
    current_cpu_usage = psutil.cpu_percent(interval=None)
    CPU_USAGE.set(current_cpu_usage)  # Postavljanje trenutne vrednosti iskorišćenosti CPU-a

    # Praćenje trajanja kreiranja posta
    with POST_CREATION_DURATION.labels(method=request.method).time():
        # Deserijalizacija podataka iz zahteva za post
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            # Kreiranje posta i povezivanje sa prijavljenim korisnikom
            post = serializer.save(user=request.user)
            
            # Keširanje lokacije posta (geografska širina i dužina)
            cache.set(f'post_location_{post.id}', (post.latitude, post.longitude), timeout=60*60)  # Keširanje na 1 sat
            
            elapsed_time = time.time() - start_time  # Izračunavanje trajanja obrade zahteva
            print(f"Post creation took {elapsed_time:.2f} seconds.")  # Opcionalni log
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    # Ako serializer nije validan, vraćamo grešku
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Middleware za praćenje broja aktivnih korisnika
class ActiveUsersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Povećavanje broja aktivnih korisnika samo ako je korisnik prijavljen
        if request.user.is_authenticated:
            ACTIVE_USERS.inc()  # Povećavamo broj aktivnih korisnika za svaki zahtev
            response = self.get_response(request)
        else:
            response = self.get_response(request)
        return response

    def process_response(self, request, response):
        # Smanjujemo broj aktivnih korisnika samo kada se korisnik odjavi ili mu istekne sesija
        if request.user.is_authenticated:
            ACTIVE_USERS.dec()  # Smanjujemo broj aktivnih korisnika nakon završetka zahteva
        return response





    


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def HomePageUserView(request):
    return Response({"message": "Welcome to the authenticated user's homepage!"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def followed_user_posts(request):
    user = request.user
    followed_users = user.verified_user.following.all().values_list('user', flat=True)
    posts = Post.objects.filter(user__in=followed_users).order_by('-id')
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    return Response({
        'username': user.username,
        'email': user.email,
    })

#! OVO JE PO TESTU KONKURENTNOG LAJKOVANJA
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like_post(request, post_id):
    try:
        with transaction.atomic():  # Pokrećemo transakciju
            post = Post.objects.select_for_update().get(id=post_id)  # Zaključavamo post
            print(f"Post {post.id} locked for user {request.user.username}.")

            # Proveravamo da li korisnik već lajkuje post
            like, created = Like.objects.get_or_create(user=request.user, post=post)
            if not created:
                # Ako već postoji lajk, brišemo ga
                like.delete()
                post.like_count = post.likes.count()
                post.save()
                return Response({"detail": "Like removed."}, status=status.HTTP_200_OK)
            else:
                # Dodajemo lajk
                post.like_count = post.likes.count()
                post.save()
                return Response({"detail": "Post liked."}, status=status.HTTP_200_OK)
    except Post.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error: {e}")
        return Response({"detail": "An error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
class RegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            # Kreiramo korisnika pomoću serializer-a
            serializer.save()
            return Response({
                'message': 'The user is successfully registered. An activation link has been sent to your email.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny]) 
def activate_account(request, activation_token):
    try:
        # Validiramo aktivacioni token
        token = AccessToken(activation_token)
        
        # Provera isteka tokena
        try:
            token.verify()
        except TokenError:
            return HttpResponse(
                """
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Account activation</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                        <h1>Account activation</h1>
                        <p>The activation link has expired! Please try to register again.</p>
                    </body>
                </html>
                """, content_type="text/html; charset=UTF-8"
            )

        user_id = token['user_id']
        user = get_user_model().objects.get(id=user_id)

        # Ako je korisnik već aktiviran, vraćamo odgovarajuću poruku
        if user.user_type == 'authenticated':
            return HttpResponse(
                """
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Account activation</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                        <h1>Account activation</h1>
                        <p>Account already activated! You can sign up now.</p>
                    </body>
                </html>
                """, content_type="text/html; charset=UTF-8"
            )

        # Aktiviramo korisnika
        user.user_type = 'authenticated'
        user.is_active = True
        user.save()

        VerifiedUser.objects.create(user=user)

        return HttpResponse(
                """
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Account activation</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                        <h1>Account activation</h1>
                        <p>Account successfully activated! You can sign up now.</p>
                    </body>
                </html>
                """, content_type="text/html; charset=UTF-8"
            )

    except Exception as e:
        # Ako token nije validan ili je istekao
        return HttpResponse(
                """
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Account activation</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                        <h1>Account activation</h1>
                        <p>The activation link has expired! Please try to register again.</p>
                    </body>
                </html>
                """, content_type="text/html; charset=UTF-8"
            )
    
class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key='ip', rate='5/m', method='POST'))
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'detail': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_user_model().objects.filter(email=email).first()

        if user is not None and user.is_active and user.check_password(password):
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_type': user.user_type,
            }, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Incorrect email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

@ratelimit(key='user', rate='50/m', method='POST', block=True)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, username):
    user_to_follow = get_object_or_404(get_user_model(), username=username)
    verified_user = request.user.verified_user
    if verified_user.following.filter(user=user_to_follow).exists():
        verified_user.following.remove(user_to_follow.verified_user)
        message = "Unfollowed successfully."
        is_following = False
    else:
        verified_user.following.add(user_to_follow.verified_user)
        message = "Followed successfully."
        is_following = True
    return Response({"message": message, "is_following": is_following}, status=status.HTTP_200_OK)

class PostListView(ListAPIView):
    queryset = Post.objects.filter(deleted=False).order_by('-id')  # sortiranje po najnovijem
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serialized_posts = []

        for post in queryset:
            # Serializacija pojedinačnog posta
            post_data = PostSerializer(post).data
            
            # Dohvatanje i serializacija komentara za taj post
            comments = post.comments.all()  # Zahvaljujući `related_name="comments"`
            serialized_comments = [
                {"user": comment.user.username, "text": comment.text, "created_at": comment.created_at}
                for comment in comments
            ]
            
            # Dodavanje komentara u serializovane podatke o postu
            post_data["comments"] = serialized_comments
            serialized_posts.append(post_data)

        return Response(serialized_posts, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, username):
        User = get_user_model()
        user = get_object_or_404(User, username=username)
        verified_user = getattr(user, 'verified_user', None)

        if verified_user:
            followers = verified_user.followers.all()
            following = VerifiedUser.objects.filter(followers=verified_user)
            follower_count = followers.count()
        else:
            followers = []
            following = []
            follower_count = 0

        followers_data = [{"username": follower.user.username} for follower in followers]
        following_data = [{"username": followed.user.username} for followed in following]

        user_posts = Post.objects.filter(user=user, deleted=False).order_by('-created_at')
        posts_serializer = PostSerializer(user_posts, many=True)

        is_following = request.user.is_authenticated and request.user.verified_user.following.filter(user=user).exists()

        return Response({
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "location": user.location,
            "follower_count": follower_count,
            "followers": followers_data,
            "following": following_data,
            "posts": posts_serializer.data,
            "is_following": is_following
        }, status=status.HTTP_200_OK)
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_name(request):
    user = request.user  # Dobijamo trenutno ulogovanog korisnika
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')

    # Validacija ulaznih podataka
    if not first_name and not last_name:
        return Response({"error": "At least one of 'first_name' or 'last_name' must be provided."}, 
                        status=status.HTTP_400_BAD_REQUEST)

    if first_name:
        user.first_name = first_name
    if last_name:
        user.last_name = last_name

    user.save()

    return Response({
        "message": "User name updated successfully.",
        "first_name": user.first_name,
        "last_name": user.last_name,
    }, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            current_password = serializer.validated_data['current_password']
            new_password = serializer.validated_data['new_password']

            if not user.check_password(current_password):
                raise serializers.ValidationError("Current password is incorrect.")
            
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def network_trends(request):
    # Ukupan broj objava
    total_posts = Post.objects.count()

    # Broj objava u poslednjih mesec dana
    one_month_ago = now() - timedelta(days=30)
    posts_last_month = Post.objects.filter(created_at__gte=one_month_ago).count()

    # Broj objava u poslednjih 7 dana
    one_week_ago = now() - timedelta(days=7)
    posts_last_week = Post.objects.filter(created_at__gte=one_week_ago).count()

    # Najpopularnije objave u prethodnih 7 dana
    top_posts_last_week = (
        Post.objects.filter(created_at__gte=one_week_ago)
        .annotate(total_likes=Count('likes'))
        .order_by('-total_likes')[:5]
    )

    # Najpopularnije objave ikada
    top_posts_all_time = (
        Post.objects.annotate(total_likes=Count('likes'))
        .order_by('-total_likes')[:10]
    )

    # 10 naloga sa najviše lajkova u prethodnih 7 dana
    top_users_last_week = (
        Post.objects.filter(created_at__gte=one_week_ago)
        .values('user')  # Uzmi samo korisnike
        .annotate(total_likes=Count('likes'))  # Broj lajkova po korisniku
        .order_by('-total_likes')[:10]
    )

    # Serijalizacija podataka
    top_posts_last_week_data = [
        {
            'id': post.id,
            'description': post.description,
            'image_url': post.image.url if post.image else None,
            'total_likes': post.total_likes,
            'created_at': post.created_at,
        }
        for post in top_posts_last_week
    ]

    top_posts_all_time_data = [
        {
            'id': post.id,
            'description': post.description,
            'image_url': post.image.url if post.image else None,
            'total_likes': post.total_likes,
            'created_at': post.created_at,
        }
        for post in top_posts_all_time
    ]

    top_users_last_week_data = [
        {
            'user_id': user['user'],
            'total_likes': user['total_likes'],
        }
        for user in top_users_last_week
    ]

    # Povratak podataka
    return Response({
        'total_posts': total_posts,
        'posts_last_month': posts_last_month,
        'posts_last_week': posts_last_week,
        'top_posts_last_week': top_posts_last_week_data,
        'top_posts_all_time': top_posts_all_time_data,
        'top_users_last_week': top_users_last_week_data,
    }, status=200)
