import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/CreatePost.css';

const EditPost = () => {
    const { postId } = useParams();
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch post details to populate form fields
        const fetchPostDetails = async () => {
            try {
                const response = await axiosInstance.get(`/posts/${postId}/`);
                const post = response.data;
                setDescription(post.description || '');
            } catch (error) {
                console.error('Error fetching post data:', error);
                setError('Failed to load post data.');
            }
        };

        fetchPostDetails();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('description', description);
        if (image) {
            formData.append('image', image); // Only append if a new image is selected
        }

        try {
            await axiosInstance.put(`/posts/${postId}/update/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Post updated successfully.');
            navigate(`/posts/${postId}/`); // Redirect to the updated post's detail view
        } catch (error) {
            console.error('Error updating post:', error);
            setError('An error occurred while updating the post.');
        }
    };

    return (
        <div className="create-post-container">
            <h2>Edit Post</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Image:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                </div>
                <button type="submit">Update Post</button>
            </form>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default EditPost;
