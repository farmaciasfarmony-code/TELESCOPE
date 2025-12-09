import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingBag, Settings, LogOut, UserCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './Admin.css';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { adminUser, logout, canAccess } = useAdminAuth();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    if (!adminUser) return null; // Should be handled by ProtectedRoute, but safety check

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <LayoutDashboard size={28} />
                    <span>Farmony Admin</span>
                </div>

                <div className="admin-user-profile" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <UserCircle size={20} color="#60a5fa" />
                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{adminUser.name}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {adminUser.role.replace('_', ' ')}
                    </div>
                </div>

                <nav className="admin-nav">
                    <Link to="/admin" className={`admin-nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>

                    {canAccess('products') && (
                        <Link to="/admin/products" className={`admin-nav-item ${isActive('/admin/products')}`}>
                            <Package size={20} />
                            <span>Productos</span>
                        </Link>
                    )}

                    {canAccess('customers') && (
                        <Link to="/admin/customers" className={`admin-nav-item ${isActive('/admin/customers')}`}>
                            <Users size={20} />
                            <span>Clientes</span>
                        </Link>
                    )}

                    {canAccess('sales') && (
                        <Link to="/admin/sales" className={`admin-nav-item ${isActive('/admin/sales')}`}>
                            <ShoppingBag size={20} />
                            <span>Ventas</span>
                        </Link>
                    )}

                    <Link to="/admin/team" className={`admin-nav-item ${isActive('/admin/team')}`}>
                        <Users size={20} />
                        <span>Equipo</span>
                    </Link>

                    <Link to="/admin/settings" className={`admin-nav-item ${isActive('/admin/settings')}`}>
                        <Settings size={20} />
                        <span>Configuración</span>
                    </Link>

                    <Link to="/admin/builder" className={`admin-nav-item ${isActive('/admin/builder')}`}>
                        <LayoutDashboard size={20} />
                        <span>Editor Web</span>
                    </Link>
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <button onClick={handleLogout} className="admin-nav-item" style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}>
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
