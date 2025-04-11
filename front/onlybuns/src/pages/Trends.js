import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance'; 
import '../styles/Trends.css';

const NetworkTrends = () => {
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const response = await axiosInstance.get('/network-trends/');
                setTrends(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching trends:', err);
                setError('Failed to load trends. Please try again later.');
                setLoading(false);
            }
        };

        fetchTrends();
    }, []);

    if (loading) {
        return <div className="network-trends-container">Loading trends...</div>;
    }

    if (error) {
        return <div className="network-trends-container error">{error}</div>;
    }

    return (
        <div className="network-trends-container">
            <h2>Network Trends</h2>

            <section>
                <h3>Statistics</h3>
                <p><strong>Total Posts:</strong> {trends.total_posts}</p>
                <p><strong>Posts in Last Month:</strong> {trends.posts_last_month}</p>
            </section>

            <section>
                <h3>Top 5 Posts Last Week</h3>
                {trends.top_posts_last_week.length > 0 ? (
                    <ul className="trend-list">
                        {trends.top_posts_last_week.map((post) => (
                            <li key={post.id} className="trend-item">
                                {post.image_url && (
                                    <img src={post.image_url} alt="Post" className="trend-image" />
                                )}
                                <p><strong>Description:</strong> {post.description}</p>
                                <p><strong>Likes:</strong> {post.total_likes}</p>
                                <p><strong>Created At:</strong> {new Date(post.created_at).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No top posts available for the last week.</p>
                )}
            </section>

            <section>
                <h3>Top 10 Users with Most Likes Last Week</h3>
                {trends.top_users_last_week && trends.top_users_last_week.length > 0 ? (
                    <ul className="trend-list">
                    {trends.top_users_last_week.map((user) => (
                        <li key={user.user_id} className="trend-item">
                            <p><strong>User ID:</strong> {user.user_id}</p>
                            <p><strong>Total Likes:</strong> {user.total_likes}</p>
                        </li>
                    ))}
                </ul>
                ) : (
                    <p>No top users available for the last week.</p>
                )}
            </section>

            <section>
                <h3>Top 10 Posts of All Time</h3>
                {trends.top_posts_all_time.length > 0 ? (
                    <ul className="trend-list">
                        {trends.top_posts_all_time.map((post) => (
                            <li key={post.id} className="trend-item">
                                {post.image_url && (
                                    <img src={post.image_url} alt="Post" className="trend-image" />
                                )}
                                <p><strong>Description:</strong> {post.description}</p>
                                <p><strong>Likes:</strong> {post.total_likes}</p>
                                <p><strong>Created At:</strong> {new Date(post.created_at).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No top posts available.</p>
                )}
            </section>
        </div>
    );
};

export default NetworkTrends;
