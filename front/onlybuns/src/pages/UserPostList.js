import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import '../styles/UserPostList.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const UserPostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentTexts, setCommentTexts] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axiosInstance.get('/api/followed-user-posts/');
                setPosts(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching posts:", error);
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handleLike = async (postId) => {
        const token = sessionStorage.getItem('access_token');

        if (!token) {
            toast.error("You must be logged in to like a post.");
            return;
        }

        try {
            const response = await axiosInstance.post(`/posts/${postId}/like/`);
            console.log("Server response:", response.data);
            const message = response.data.detail;
            if (message === "Post liked.") {
                setPosts(posts.map(post =>
                    post.id === postId
                        ? { ...post, like_count: post.like_count + 1 }
                        : post
                ));
            } else if (message === "Like removed.") {
                setPosts(posts.map(post =>
                    post.id === postId
                        ? { ...post, like_count: post.like_count - 1 }
                        : post
                ));
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleCommentTextChange = (postId, text) => {
        setCommentTexts(prev => ({
            ...prev,
            [postId]: text
        }));
    };

    const handleComment = async (postId) => {
        const token = sessionStorage.getItem('access_token');

        if (!token) {
            toast.error("You must be logged in to comment.");
            return;
        }

        try {
            const response = await axiosInstance.post(`/posts/${postId}/comment/`, { text: commentTexts[postId] || '' });
            setPosts(posts.map(post =>
                post.id === postId
                    ? { ...post, comments: [...post.comments, response.data] }
                    : post
            ));
            setCommentTexts(prev => ({ ...prev, [postId]: '' }));
        } catch (error) {
            console.error("Error toggling like:", error);
            if (error.response) {
                console.log("Error details:", error.response.data);
            }
        }
    };

    const handleUsernameClick = (username) => {
        navigate(`/profile/${username}`);
    };

    if (loading) {
        return <div>Loading posts...</div>;
    }

    return (
        <div className="post-list">
            <h2>Posts from Followed Users</h2>
            {posts.length > 0 ? (
                posts.map((post) => (
                    <div key={post.id} className="post-item">
                        <h3>
                            <button className="username-link" onClick={() => handleUsernameClick(post.user_username)}>
                                {post.user_username}
                            </button>
                        </h3>
                        <p>{post.description}</p>
                        {post.image && (
                            <img src={post.image} alt="Post" />
                        )}
                        <p className="likes">Likes: {post.like_count}</p>
                        <button
                            className="like-button"
                            onClick={() => handleLike(post.id)}
                        >
                            {'Like'}
                        </button>

                        <h4>Comments</h4>
                        {post.comments && post.comments.length > 0 ? (
                            <div className="comments">
                                {post.comments.map((comment) => (
                                    <div key={comment.id} className="comment">
                                        <strong>
                                            <button className="username-link" onClick={() => handleUsernameClick(comment.user_username)}>
                                                {comment.user_username}
                                            </button>
                                        </strong> : {comment.text}
                                        <br />
                                        <small>{new Date(comment.created_at).toLocaleString()}</small>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No comments yet.</p>
                        )}

                        {/* Comment Section */}
                        <div className="comment-section">
                            <textarea
                                value={commentTexts[post.id] || ''}
                                onChange={(e) => handleCommentTextChange(post.id, e.target.value)}
                                placeholder="Add a comment"
                            />
                            <button
                                className="comment-button"
                                onClick={() => handleComment(post.id)}
                            >
                                Post Comment
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p>No posts available. Follow some profiles to see their posts.</p>
            )}
        <ToastContainer position="bottom-right"/>
        </div>
    );
};

export default UserPostList;