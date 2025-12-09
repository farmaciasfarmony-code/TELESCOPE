import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { subscribeToOrders } from '../../services/orderService';

const StatCard = ({ title, value, icon: Icon, subtext }) => (
    <div className="stat-card">
        <div className="stat-header">
            <div className="stat-icon">
                <Icon size={24} />
            </div>
        </div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
        {subtext && <div className="stat-subtext" style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>{subtext}</div>}
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0
    });
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToOrders((orders) => {
            // Calculate Stats
            const revenue = orders.reduce((acc, order) => {
                // Don't count cancelled orders in revenue
                if (order.status === 'cancelled') return acc;
                return acc + (Number(order.total) || 0);
            }, 0);
            const uniqueCustomers = new Set(orders.map(o => o.customer?.email)).size;

            setStats({
                totalRevenue: revenue,
                totalOrders: orders.length,
                totalCustomers: uniqueCustomers
            });

            // Get recent 5 sales
            setRecentSales(orders.slice(0, 5));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'status-success';
            case 'processing': return 'status-warning';
            case 'cancelled': return 'status-danger';
            default: return 'status-warning';
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h1 className="admin-title">Dashboard General</h1>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    title="Ingresos Totales"
                    value={`$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    subtext="Ingresos históricos"
                />
                <StatCard
                    title="Pedidos Totales"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    subtext="Pedidos realizados"
                />
                <StatCard
                    title="Clientes Únicos"
                    value={stats.totalCustomers}
                    icon={Users}
                    subtext="Basado en emails únicos"
                />
            </div>

            {/* Recent Sales Preview */}
            <div className="data-table-container">
                <div className="table-header">
                    <h2 className="table-title">Ventas Recientes</h2>
                </div>
                {loading ? (
                    <div className="p-4 text-center">Cargando datos...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID Pedido</th>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSales.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-4">No hay ventas recientes.</td>
                                </tr>
                            ) : (
                                recentSales.map(sale => (
                                    <tr key={sale.id}>
                                        <td style={{ fontFamily: 'monospace' }}>{sale.id.slice(0, 8)}...</td>
                                        <td>{sale.customer?.fullName || 'Cliente'}</td>
                                        <td>
                                            {sale.createdAt ? sale.createdAt.toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td>${(sale.total || 0).toFixed(2)}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusColor(sale.status)}`}>
                                                {sale.status || 'pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
