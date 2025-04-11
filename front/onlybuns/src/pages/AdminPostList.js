import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/PostList.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminPostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/posts/'); // Fetch svih objava
                setPosts(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching posts:", error);
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const sendPostForAds = async (post) => {
        const token = sessionStorage.getItem('access_token'); // Uzmi access token iz sessionStorage

        if (!token) {
            toast.error('Please log in first!');
            return;
        }

        try {
            const response = await fetch('/api/send-post/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Dodaj Authorization header
                },
                body: JSON.stringify({
                    description: post.description,
                    time: post.created_at, // Pretpostavlja se da `created_at` postoji u podacima o objavi
                    username: post.user_username,
                }),
            });

            if (response.ok) {
                toast.success('Post sent to agencies!');
            } else {
                toast.error('Error sending post to agencies.');
            }
        } catch (error) {
            console.error('Error sending post:', error);
            toast.error('Error sending post to agencies.');
        }
    };

    if (loading) {
        return <div>Loading posts...</div>;
    }

    return (
        <div className="post-list">
            <h2>Admin Panel - Posts</h2>
            {posts.length > 0 ? (
                posts.map((post) => (
                    <div key={post.id} className="post-item">
                        <h3>{post.user_username}</h3>
                        <p>{post.description}</p>
                        {post.image && (
                            <img src={post.image} alt="Post" />
                        )}
                        <p className="post-date">Created at: {new Date(post.created_at).toLocaleString()}</p>
                        
                        {/* Dugme za slanje objave na reklame */}
                        <button
                            className="advertise-button"
                            onClick={() => sendPostForAds(post)}
                        >
                            Advertise Post
                        </button>
                    </div>
                ))
            ) : (
                <p>No posts available.</p>
            )}
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default AdminPostList;
