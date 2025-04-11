import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const isAuthenticated = !!sessionStorage.getItem('access_token'); // Proveri da li postoji token
    const userType = sessionStorage.getItem('user_type'); // Učitaj user_type iz sessionStorage

    // Dozvoli pristup samo ako je user_type "admin"
    if (isAuthenticated && userType === 'admin') {
        return children;
    } else {
        return <Navigate to="/login" />;
    }
};

export default AdminRoute;
