# 🧁 OnlyBuns - Social Media Platform

![Made with Django](https://img.shields.io/badge/backend-Django-blue)
![Made with React](https://img.shields.io/badge/frontend-React-blue)

OnlyBuns is a modern social media platform where users can create and share posts, interact through likes and comments, follow each other, and receive notifications. It includes robust features like user authentication, profile management, admin tools, and background task automation.

---

## ✨ Features

- 🔐 **Authentication** – Register, log in, and manage user accounts securely
- 📝 **Post Management** – Create, edit, delete, and view posts with images and descriptions
- 💬 **Comment System** – Add and view comments on posts
- ❤️ **Like Functionality** – Like or unlike posts
- 👤 **User Profiles** – Follow users, view followers/following, and manage profile details
- 📬 **Email Notifications** – Automated weekly updates for inactive users
- 🛠️ **Admin Dashboard** – View and manage registered users
- ⚙️ **Background Tasks** – Automated actions like deleting inactive users and compressing images

---

## 🛠️ Tech Stack

| Layer        | Technology |
|-------------|------------|
| **Frontend** | React, React Router, Axios, React Toastify, CSS |
| **Backend**  | Django, Django REST Framework, Django Simple JWT |
| **Database** | PostgreSQL |
| **Background Tasks** | Django Background Tasks |
| **Other Tools** | Git, VSCode, Docker (optional) |

---

## 🚀 Getting Started

### 📦 Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL
- (Optional) Virtual environment

---

### 🧪 Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd back/onlybuns
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Apply migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

5. Run the development server:
   ```bash
   python manage.py runserver
   ```

---

### 🎨 Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd front/onlybuns
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend:
   ```bash
   npm start
   ```

---

### ⏱️ Background Tasks

1. Start the task processor:
   ```bash
   python manage.py process_tasks
   ```

---

## 💡 Usage

- Open your browser at `http://localhost:3000`
- Register or log in to your account
- Create and interact with posts
- Manage your profile and follow others
- Admins can access the dashboard at `http://localhost:8000/admin`

---

## 🗂️ Project Structure

```
OnlyBuns_Social_Platform/
├── back/
│   └── onlybuns/
│       ├── app/               # Django app files
│       ├── tasks.py           # Background tasks
│       ├── urls.py            # API routes
├── front/
│   └── onlybuns/
│       ├── src/components/    # Reusable React components
│       ├── src/pages/         # Page-level components
│       ├── src/styles/        # CSS files
```

---

## 🔌 API Endpoints (Examples)

### 🔓 Public
- `POST /register/` – Register a new user  
- `POST /login/` – Log in  
- `GET /posts/` – Fetch all posts  

### 🔐 Protected
- `POST /posts/:postId/like/` – Like/unlike a post  
- `POST /posts/:postId/comment/` – Comment on a post  
- `GET /api/user-profile/` – Get logged-in user profile  
