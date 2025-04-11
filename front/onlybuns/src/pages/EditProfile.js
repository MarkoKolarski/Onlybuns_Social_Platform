import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../styles/EditProfile.css';

const EditProfile = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const updateData = {};
        if (firstName) updateData.first_name = firstName;
        if (lastName) updateData.last_name = lastName;

        try {
            await axiosInstance.put('/update-name/', updateData);
            setSuccess(true);
            setTimeout(() => {
                navigate(-1);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred.');
        }
    };

    return (
        <div className="edit-profile-container">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="firstName">First Name:</label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Last Name:</label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">Profile updated successfully!</p>}
                <button type="submit" className="btn-primary">Update</button>
            </form>
        </div>
    );
};

export default EditProfile;
