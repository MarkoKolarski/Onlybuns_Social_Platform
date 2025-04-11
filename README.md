# 🐇 OnlyBuns – Social Media Platform

![Django](https://img.shields.io/badge/backend-Django-blue)
![React](https://img.shields.io/badge/frontend-React-blue)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-blue)
![RabbitMQ](https://img.shields.io/badge/message--queue-RabbitMQ-orange)
![Monitoring](https://img.shields.io/badge/monitoring-Prometheus%20%26%20Grafana-green)

> A modern full-stack social media platform built with Django and React. Features include post sharing, likes, comments, user following, notifications, admin dashboard, background tasks, and real-time monitoring.

---

## ✨ Features

- 🔐 **Authentication** – Secure user registration, login, and JWT-based authentication
- 📝 **Post Management** – Create, update, delete, and view posts with images and captions
- 💬 **Comment System** – Leave and view comments on posts
- ❤️ **Like Functionality** – Like and unlike posts
- 👤 **User Profiles** – Follow other users and manage your profile
- 📬 **Email Notifications** – Weekly email updates for inactive users
- 🛠️ **Admin Dashboard** – Manage users and flagged content
- ⚙️ **Background Tasks** – Automate tasks like image compression and user pruning
- 📊 **Monitoring** – Live metrics with Prometheus and Grafana:
  - Avg. duration of post creation requests
  - CPU usage over time
  - Number of active users
- 📢 **Advertising Integration** – Fanout messages to external agencies:
  - Send post data (description, timestamp, user)
  - Demonstrate scalable real-time messaging with RabbitMQ

---

## 🧰 Tech Stack

| Layer          | Technologies |
|----------------|--------------|
| **Frontend**   | React, React Router, Axios, React Toastify, CSS |
| **Backend**    | Django, Django REST Framework, Simple JWT |
| **Database**   | PostgreSQL |
| **Message Queue** | RabbitMQ |
| **Monitoring** | Prometheus, Grafana |
| **Background Tasks** | Django Background Tasks |
| **Dev Tools**  | Git, VSCode, Docker (optional) |

---

## 🚀 Getting Started

### 📦 Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL
- RabbitMQ
- Prometheus & Grafana
- (Optional) Virtual environment

---

### 🧪 Backend Setup

```bash
# Navigate to backend
cd back/onlybuns

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

---

### 🎨 Frontend Setup

```bash
# Navigate to frontend
cd front/onlybuns

# Install dependencies
npm install

# Start the app
npm start
```

---

### 📊 Monitoring Setup

1. Install and configure **Prometheus** and **Grafana**.
2. Integrate Prometheus client with Django to expose metrics:
   - HTTP request duration
   - CPU usage
   - Active user count
3. Visualize the metrics in Grafana by connecting it to Prometheus.

---

### 📢 Advertising Queue Setup

```bash
# Make sure RabbitMQ server is running

# Run the advertising agency client
python back/onlybuns/app/ads_client.py
```

- Admins can mark posts for advertising via admin panel or frontend.
- Messages are sent to all connected agency clients via RabbitMQ fanout exchange.

---

### ⏱️ Background Tasks

```bash
# Start task processor
python manage.py process_tasks
```

---

## 💡 Usage

- Open your browser at: `http://localhost:3000`
- Register or log in to your account
- Create, like, and comment on posts
- Follow other users and manage your profile
- Admins can log in at: `http://localhost:8000/admin`
- Monitor activity via Grafana dashboard
- Run multiple advertising clients to simulate external agencies

---

## 📁 Project Structure

```
OnlyBuns_Social_Platform/
├── back/
│   └── onlybuns/
│       ├── app/               # Django application
│       ├── tasks.py           # Background task definitions
│       ├── urls.py            # API routes
├── front/
│   └── onlybuns/
│       ├── src/
│       │   ├── components/    # Reusable React components
│       │   ├── pages/         # Page-level components
│       │   └── styles/        # CSS styles
```

---

## 🔌 API Endpoints

### 🔓 Public

| Method | Endpoint        | Description              |
|--------|------------------|--------------------------|
| POST   | `/register/`     | Register a new user      |
| POST   | `/login/`        | Log in and get JWT token |
| GET    | `/posts/`        | Retrieve all posts       |

### 🔐 Protected (JWT)

| Method | Endpoint                      | Description                |
|--------|-------------------------------|----------------------------|
| POST   | `/posts/:postId/like/`        | Like or unlike a post      |
| POST   | `/posts/:postId/comment/`     | Add a comment to a post    |
| GET    | `/api/user-profile/`          | Get current user profile   |
| POST   | `/api/send-post/`             | Send a post to ad agencies |

---

## 🙌 Acknowledgements

- [Django](https://www.djangoproject.com/)
- [React](https://reactjs.org/)
- [RabbitMQ](https://www.rabbitmq.com/)
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)