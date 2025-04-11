import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import defaultProfilePic from '../static/default-profile.png';
import postsImage from '../static/posts.png';
import trendsImage from '../static/trends.png';
import nearbyImage from '../static/nearby.jpg';
import chatImage from '../static/chat.jpg';
import '../styles/HomePageUser.css';

const HomePageUser = () => {
    const [username, setUsername] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Initialize to null

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get('/api/user-profile/');
                setUsername(response.data.username);
                setIsAuthenticated(true); // Set to true if the request is successful
            } catch (error) {
                console.error('Error fetching user data:', error);
                setIsAuthenticated(false); // Set to false if there's an error
            }
        };
        
        fetchUserData();
    }, []);

    if (isAuthenticated === null) {
        return null; // Render nothing while authentication status is being determined
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="homepage-user-container">
            <div className="header">
                <div className="user-info">
                    <span className="username">{username}</span>
                    <img src={defaultProfilePic} alt="Profile" className="profile-pic" />
                </div>
            </div>
            <h1>Welcome to OnlyBuns</h1>
            <div className="link-sections">
                <div className="link-section">
                    <Link to="/userpostlist" className="link">
                        <img src={postsImage} alt="Posts" className="link-image" />
                        <span>User Post List</span>
                    </Link>
                </div>
                <div className="link-section">
                    <Link to="/trends" className="link">
                        <img src={trendsImage} alt="Trends" className="link-image" />
                        <span>Network Trends</span>
                    </Link>
                </div>
                <div className="link-section">
                    <Link to="/nearby" className="link">
                        <img src={nearbyImage} alt="Nearby" className="link-image" />
                        <span>Nearby Posts Map</span>
                    </Link>
                </div>
                <div className="link-section">
                    <Link to="/chat" className="link">
                        <img src={chatImage} alt="Chat" className="link-image" />
                        <span>User Chat</span>
                    </Link>
                </div>
                <div className="link-section">
                    <Link to={`/profile/${username}`} className="link">
                        <img src={defaultProfilePic} alt="Profile" className="link-image" />
                        <span>User Profile</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HomePageUser;