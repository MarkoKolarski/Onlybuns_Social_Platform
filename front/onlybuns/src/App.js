import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PostDetail from './pages/PostDetail';
import Register from './pages/Register';
import Login from './pages/Login';
import PostList from './components/PostList';
import NavBar from './components/NavBar';
import Trends from './pages/Trends';
import Nearby from './pages/Nearby';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import HomePageUser from './pages/HomePageUser';
import UserPostList from './pages/UserPostList';
import PrivateRoute from './components/PrivateRoute';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import RegisteredUsers from './pages/RegisteredUsers';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import AdminPostList from './pages/AdminPostList';
import AdminRoute from './components/AdminRoute';


const App = () => {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/" element={<PostList />} />
                <Route path="/posts" element={<PostList />} />
                <Route path="/posts/:postId" element={<PostDetail />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/homepageuser" element={<PrivateRoute><HomePageUser /></PrivateRoute>} />
                <Route path="/trends" element={<PrivateRoute><Trends /></PrivateRoute>} />
                <Route path="/nearby" element={<PrivateRoute><Nearby /></PrivateRoute>} />
                <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/userpostlist" element={<PrivateRoute><UserPostList /></PrivateRoute>} />
                <Route path="/createpost" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
                <Route path="/posts/:postId/edit" element={<EditPost />} />
                <Route path="/admin/registered-users" element={<RegisteredUsers />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/profile/edit" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
                <Route path="/profile/editpass" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
                <Route path="/admin/posts" element={<AdminRoute><AdminPostList /></AdminRoute>} /> {/* Admin ruta */}
            </Routes>
        </Router>
    );
};

export default App;