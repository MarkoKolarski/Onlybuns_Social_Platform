import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/PostList.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentTexts, setCommentTexts] = useState({});
    const [showAllComments, setShowAllComments] = useState({});
    const [newPostDescription, setNewPostDescription] = useState('');
    const [newPostImage, setNewPostImage] = useState(null);
    const [newPostLatitude, setNewPostLatitude] = useState(null);
    const [newPostLongitude, setNewPostLongitude] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/posts/');
                setPosts(response.data);

                const initialShowAllComments = {};
                response.data.forEach(post => {
                    initialShowAllComments[post.id] = false;
                });
                setShowAllComments(initialShowAllComments);
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
    
        const commentText = commentTexts[postId]?.trim();
        if (!commentText) {
            toast.error("Comment text cannot be empty.");
            return;
        }
    
        try {
            const response = await axiosInstance.post(`/posts/${postId}/comment/`, {
                text: commentText
            });
    
            setPosts(posts.map(post =>
                post.id === postId
                    ? { ...post, comments: [response.data, ...post.comments] }
                    : post
            ));
            setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    
        } catch (error) {
            if (error.response?.status === 429) {
                toast.error("Rate limit exceeded. Please wait before posting another comment.");
            } else {
                toast.error(error.response?.data?.detail || "Error posting comment.");
            }
        }
    };
    
    

    
    const handleUsernameClick = (username) => {
        navigate(`/profile/${username}`);
    };

    const handleDetailsClick = (postId) => {
        navigate(`/posts/${postId}`);
    };

    const toggleExpandComments = (postId) => {
        setShowAllComments(prev => ({
            ...prev,
            [postId]: !prev[postId],
        }));
    };


    const handlePostSubmit = async (e) => {
        e.preventDefault();
    
        const formData = new FormData();
        formData.append('description', newPostDescription);
        formData.append('image', newPostImage);
        formData.append('latitude', newPostLatitude);
        formData.append('longitude', newPostLongitude);
    
        try {
            const response = await axiosInstance.post('/api/create-post/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // Dodaj novu objavu u početak liste
            setPosts([{
                ...response.data,
                comments: [] // Dodaj praznu listu komentara za novu objavu
            }, ...posts]); 
            setNewPostDescription('');
            setNewPostImage(null);
            setNewPostLatitude(null);
            setNewPostLongitude(null);
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('An error occurred while creating the post.');
        }
    };
    

    const handleMapClick = (event) => {
        setNewPostLatitude(event.latLng.lat());
        setNewPostLongitude(event.latLng.lng());
    };

    if (loading) {
        return <div>Loading posts...</div>;
    }

    return (
        <div className="post-list">
            <h1 style={{ fontSize: '3rem', textAlign: 'center', textTransform: 'uppercase', marginBottom: '20px' }}>
                Recent Posts
            </h1>
            {/* Smanjen naslov Create Post */}
            <h2 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '20px' }}>
                Create Post
            </h2>
            <form onSubmit={handlePostSubmit} className="create-post-form">
            <textarea
                placeholder="Write your post..."
                value={newPostDescription}
                onChange={(e) => setNewPostDescription(e.target.value)}
                required
            />
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewPostImage(e.target.files[0])}
                required
            />
            {/* Add a map to select location */}
            <div className="map-container">
                <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                    <GoogleMap
                        mapContainerStyle={{ height: '100%', width: '100%' }}
                        center={{ lat: 45.2671, lng: 19.8335 }}
                        zoom={13}
                        onClick={handleMapClick}
                    >
                        {newPostLatitude && newPostLongitude && (
                            <Marker position={{ lat: newPostLatitude, lng: newPostLongitude }} />
                        )}
                    </GoogleMap>
                </LoadScript>
            </div>
            <button type="submit">Create Post</button>
        </form>


            
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
                            Like
                        </button>

                        <button
                            className="details-button"
                            onClick={() => handleDetailsClick(post.id)}
                        >
                            Details
                        </button>

                        <h4>Comments</h4>
                        {post.comments && Array.isArray(post.comments) && post.comments.length > 0 ? (
                            <div className="comments-container">
                                <div
                                    className="comments"
                                    style={{
                                        maxHeight: showAllComments[post.id] ? 'none' : 'none', // Početno svi komentari
                                        overflowY: showAllComments[post.id] ? 'auto' : 'hidden', // Skrolovanje samo kada je prošireno
                                    }}
                                >
                                    {post.comments.slice(0, showAllComments[post.id] ? post.comments.length : 3).map((comment, index) => (
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
                                                <small className="comment-date">
                                                    {new Date(comment.created_at).toLocaleString()}
                                                </small>
                                            </div>
                                            <p>{comment.text}</p>
                                        </div>
                                    ))}
                                </div>
                                {post.comments.length > 3 && ( // Dugme se prikazuje samo ako ima više od 3 komentara
                                    <button className="expand-comments" onClick={() => toggleExpandComments(post.id)}>
                                        {showAllComments[post.id] ? "Show Less" : "Show All"}
                                    </button>
                                )}
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
                <p>No posts available.</p>
            )}
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default PostList;