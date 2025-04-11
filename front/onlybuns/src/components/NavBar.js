import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Uklanjanje tokena iz sessionStorage
        sessionStorage.removeItem('access_token');
        // Preusmeravanje na login stranicu
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <h1 className="title">
                <Link to="/" className="title-link">Only Buns</Link>
            </h1>
            <ul className="nav-links">
                <li><Link to="/login" className="nav-link">Login</Link></li>
                <li><Link to="/register" className="nav-link">Register</Link></li>
                <li><button className="nav-button logout-button" onClick={handleLogout}>Logout</button></li>
            </ul>
        </nav>
    );
};

export default Navbar;
