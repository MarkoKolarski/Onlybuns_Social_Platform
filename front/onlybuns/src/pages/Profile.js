import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../styles/Profile.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
    const { username } = useParams(); // Preuzima username iz URL-a
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loggedInUsername, setLoggedInUsername] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axiosInstance.get(`/profile/${username}/`);
                setProfileData(response.data);
                setIsFollowing(response.data.is_following);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setLoading(false);
            }
        };

        const fetchLoggedInUser = async () => {
            try {
                const response = await axiosInstance.get('/api/user-profile/');
                setLoggedInUsername(response.data.username);
            } catch (error) {
                console.error("Error fetching logged in user data:", error);
            }
        };

        fetchProfileData();
        fetchLoggedInUser();
    }, [username]);

    const handleFollowToggle = async () => {
        const token = sessionStorage.getItem('access_token');
    
        if (!token) {
            toast.error("You must be logged in to follow/unfollow.");
            return;
        }
    
        try {
            const response = await axiosInstance.post(`/profile/${username}/follow/`);
            setIsFollowing(response.data.is_following);
            window.location.reload();
        } catch (error) {
            console.error("Error following/unfollowing user:", error);
            toast.warn("Odmori malo.");
        }
    };

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (!profileData) {
        return <div>Profile not found.</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2>{profileData.first_name} {profileData.last_name}</h2>
                <p><strong>Email:</strong> {profileData.email}</p>
                <p><strong>Location:</strong> {profileData.location || 'Not provided'}</p>
                <p><strong>Followers:</strong> {profileData.follower_count}</p>
                {loggedInUsername !== username && (
                    <button className="follow-button" onClick={handleFollowToggle}>
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                )}
            </div>

            <div className="profile-follow">
                <div>
                    <h3>Followers:</h3>
                    {profileData.followers.length > 0 ? (
                        profileData.followers.map((follower, index) => (
                            <p key={index} className="profile-link">
                                <a href={`/profile/${follower.username}`}>{follower.username}</a>
                            </p>
                        ))
                    ) : (
                        <p>No followers yet.</p>
                    )}
                </div>
                <div>
                    <h3>Following:</h3>
                    {profileData.following.length > 0 ? (
                        profileData.following.map((followed, index) => (
                            <p key={index} className="profile-link">
                                <a href={`/profile/${followed.username}`}>{followed.username}</a>
                            </p>
                        ))
                    ) : (
                        <p>Not following anyone.</p>
                    )}
                </div>
            </div>

            <div className="button-container">
                <button 
                    className="edit-profile-button"
                    onClick={() => navigate('/profile/edit')}
                >
                    Edit Profile
                </button>
                <button 
                    className="edit-profile-button"
                    onClick={() => navigate('/profile/editpass')}
                >
                    Edit Password
                </button>
            </div>
        
            <div className="profile-posts">
                <h3>Posts:</h3>
                {profileData.posts.length > 0 ? (
                    profileData.posts.map((post) => (
                        <div key={post.id} className="profile-post-item">
                            <p>{post.description}</p>
                            {post.image && <img src={post.image} alt="Post" />}
                            <p><strong>Likes:</strong> {post.like_count}</p>
                            <a href={`/posts/${post.id}`} className="details-link">View Details</a>
                        </div>
                    ))
                ) : (
                    <p>No posts yet.</p>
                )}
            </div>
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default Profile;
