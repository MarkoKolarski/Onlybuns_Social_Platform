import React, { useState, useCallback } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import '../styles/CreatePost.css';

const mapContainerStyle = {
    height: '100%',
    width: '100%',
};

const center = {
    lat: 45.2671,
    lng: 19.8335,
};

const CreatePost = () => {
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleMapClick = useCallback((event) => {
        setLatitude(event.latLng.lat());
        setLongitude(event.latLng.lng());
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('description', description);
        formData.append('image', image);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);

        try {
            const response = await axiosInstance.post('/api/create-post/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response.data);
            navigate('/'); // Preusmeravanje na početnu stranicu nakon kreiranja objave
        } catch (error) {
            console.error('Error creating post:', error);
            setError('An error occurred while creating the post.');
        }
    };

    return (
        <div className="create-post-container">
            <h2>Create Post</h2>
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
                        required
                    />
                </div>
                <div className="map-container">
                    <label>Location:</label>
                    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={center}
                            zoom={13}
                            onClick={handleMapClick}
                        >
                            {latitude && longitude && (
                                <Marker position={{ lat: latitude, lng: longitude }} />
                            )}
                        </GoogleMap>
                    </LoadScript>
                </div>
                <button type="submit">Create Post</button>
            </form>
        </div>
    );
};

export default CreatePost;