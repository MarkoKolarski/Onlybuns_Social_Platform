import React, { useState } from 'react';
import axiosInstance from '../axiosInstance';
import '../styles/ChangePassword.css';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage('');
    
        try {
            await axiosInstance.post('/change-password/', formData);
            setMessage('Password updated successfully!');
        } catch (error) {
            if (error.response) {
                const backendErrors = error.response.data;
                setErrors(backendErrors);
                setMessage(backendErrors.detail || 'Error!\nIncorrect current password or new ones do not match!');
            }
        }
    };

    return (
        <div className="change-password-container">
    <h2>Change Password</h2>

    {message && (
        <p className={`message ${message.includes('success') ? 'success' : 'error'}`}>
    {message}
        </p>
    )}

    <form onSubmit={handleSubmit} className="password-form">
        <div className="form-group">
            <label htmlFor="current_password">Current Password:</label>
            <input
                type="password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                required
            />
            {errors.current_password && <p className="error-message">{errors.current_password}</p>}
        </div>

        <div className="form-group">
            <label htmlFor="new_password">New Password:</label>
            <input
                type="password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                required
            />
            {errors.new_password && <p className="error-message">{errors.new_password}</p>}
        </div>

        <div className="form-group">
            <label htmlFor="confirm_password">Confirm New Password:</label>
            <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
            />
            {errors.confirm_password && <p className="error-message">{errors.confirm_password}</p>}
        </div>

        <button type="submit" className="btn-primary">Change Password</button>
    </form>
</div>
    );
};

export default ChangePassword;
