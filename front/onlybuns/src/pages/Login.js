import React, { useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage('');

        try {
            const response = await axiosInstance.post('login/', formData);
            setMessage('Uspešna prijava!');
            sessionStorage.setItem('access_token', response.data.access);
            sessionStorage.setItem('refresh_token', response.data.refresh);
            sessionStorage.setItem('username', response.data.username);
            sessionStorage.setItem('user_type', response.data.user_type); // Dodaj user_type u sessionStorage
            
            // Redirect to HomePageUser after successful login
            if (response.data.user_type === 'admin') {
                navigate('/admin/registered-users'); // Stranica za admin korisnike
            } else {
                navigate('/HomePageUser'); // Stranica za obične korisnike
            }
        } catch (error) {
            if (error.response) {
                // Handle different error statuses here
                if (error.response.status === 403) {
                    // If the error is 403 Forbidden (ratelimit exceeded)
                    setMessage('Too many login attempts. Please try again later.');
                } else if (error.response.data) {
                    // Handle other errors (e.g., invalid credentials)
                    setErrors(error.response.data);
                }
            }
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            
            {message && <p className="message error">{message}</p>}
            
            {errors.detail && <p className="message error">{errors.detail}</p>}

            <form onSubmit={handleSubmit} className="login-form">
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                {errors.email && <p className="error-message">{errors.email}</p>}

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                {errors.password && <p className="error-message">{errors.password}</p>}

                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Login;
