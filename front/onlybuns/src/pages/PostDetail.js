import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import axiosInstance from '../axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PostDetail = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState(null); // New state for the logged-in username
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch post details
        const fetchPost = async () => {
            try {
                const response = await api.get(`/posts/${postId}/`);
                setPost(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching post details:", error);
                setLoading(false);
            }
        };

        // Fetch logged-in user's data to get their username
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get('/api/user-profile/');
                setUsername(response.data.username);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchPost();
        fetchUserData();
    }, [postId]);

    const handleLike = async () => {
        const token = sessionStorage.getItem('access_token');

        if (!token) {
            toast.error("You must be logged in to like a post.");
            return;
        }

        try {
            const response = await axiosInstance.post(`/posts/${postId}/like/`);
            const message = response.data.detail;
            if (message === "Post liked.") {
                setPost(prevPost => ({
                    ...prevPost,
                    like_count: prevPost.like_count + 1
                }));
            } else if (message === "Like removed.") {
                setPost(prevPost => ({
                    ...prevPost,
                    like_count: prevPost.like_count - 1
                }));
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            toast.error("Error toggling like.");
        }
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/posts/${postId}/delete/`);
            toast.success("Post deleted successfully.");
            navigate('/');
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("Failed to delete post.");
        }
    };

    const handleEdit = () => {
        navigate(`/posts/${postId}/edit`);
    };

    const handleUsernameClick = (username) => {
        navigate(`/profile/${username}`);
    };

    const handleAddComment = async (text) => {
        const token = sessionStorage.getItem('access_token');

        if (!token) {
            toast.error("You must be logged in to comment.");
            return;
        }

        try {
            const response = await axiosInstance.post(`/posts/${postId}/comment/`, { text });
            const newComment = response.data;
            setPost(prevPost => ({
                ...prevPost,
                comments: [newComment, ...prevPost.comments] // Add new comment at the start
            }));
        } catch (error) {
            if (error.response?.status === 429) {
                toast.error("Rate limit exceeded. Please wait before posting another comment.");
            } else {
                console.error("Error adding comment:", error);
                toast.error("Error adding comment.");
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!post) {
        return <div>No post found.</div>;
    }

    return (
        <div>
            <h2>
                <button className="username-link" onClick={() => handleUsernameClick(post.user_username)}>
                    {post.user_username}
                </button>
            </h2>
            <p>{post.description}</p>
            {post.image && (
                <img src={post.image} alt="Post" style={{ maxWidth: '100%' }} />
            )}
            <p>Likes: {post.like_count}</p>
            <button onClick={handleLike}>Like</button>

            {/* Show Edit/Delete buttons only if logged-in user is the post creator */}
            {post.user_username === username && (
                <>
                    <button onClick={handleEdit}>Edit</button>
                    <button onClick={handleDelete}>Delete</button>
                </>
            )}

            <h3>Comments</h3>
            <div className="comment-section">
                <textarea
                    placeholder="Add a comment"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(e.target.value);
                            e.target.value = '';
                        }
                    }}
                />
                <button className="comment-button" onClick={() => {
                    const textarea = document.querySelector('.comment-section textarea');
                    handleAddComment(textarea.value);
                    textarea.value = '';
                }}>Post Comment</button>
            </div>
            <div className="comments">
                {post.comments && Array.isArray(post.comments) && post.comments.length > 0 ? (
                    post.comments.map((comment, index) => (
                        <div key={comment.id} className="comment">
                            <div className="comment-header">
                                <span className="comment-number">{index + 1}.</span>
                                <strong>
                                    <button
                                        className="username-link"
                                        onClick={() => handleUsernameClick(comment.user)}
                                    >
                                        {comment.user}
                                    </button>
                                </strong>
                                <small className="comment-date">{new Date(comment.created_at).toLocaleString()}</small>
                            </div>
                            <div className="comment-text">{comment.text}</div>
                        </div>
                    ))
                ) : (
                    <p>No comments yet.</p>
                )}
            </div>

            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default PostDetail;
