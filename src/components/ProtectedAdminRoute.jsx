import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const ProtectedAdminRoute = ({ children, requiredModule }) => {
    const { adminUser, loading, canAccess } = useAdminAuth();
    const location = useLocation();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Verificando credenciales...</div>;
    }

    if (!adminUser) {
        // Redirect to admin login, saving the location they tried to access
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    if (requiredModule && !canAccess(requiredModule)) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
                <h1>Acceso Denegado</h1>
                <p>No tienes permisos para ver esta sección.</p>
            </div>
        );
    }

    return children;
};

export default ProtectedAdminRoute;
