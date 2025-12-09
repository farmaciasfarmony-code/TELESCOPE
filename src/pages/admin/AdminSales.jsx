import React, { useState, useEffect } from 'react';
import { subscribeToOrders, updateOrderStatus } from '../../services/orderService';
import { Eye, CheckCircle, Clock, XCircle, Package } from 'lucide-react';

const AdminSales = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const unsubscribe = subscribeToOrders((data) => {
            setOrders(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (error) {
            alert("Error al actualizar el estado del pedido");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'status-success';
            case 'processing': return 'status-warning';
            case 'cancelled': return 'status-danger';
            default: return 'status-warning'; // pending
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed': return 'Completado';
            case 'processing': return 'En Proceso';
            case 'cancelled': return 'Cancelado';
            case 'pending': return 'Pendiente';
            default: return status;
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h1 className="admin-title">Historial de Ventas</h1>
            </div>

            {loading ? (
                <div className="p-8 text-center">Cargando pedidos...</div>
            ) : (
                <div className="data-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID Pedido</th>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-4">No hay pedidos registrados.</td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{order.id.slice(0, 8)}...</td>
                                        <td>
                                            <div style={{ fontWeight: 'bold' }}>{order.customer?.fullName}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{order.customer?.email}</div>
                                        </td>
                                        <td>
                                            {order.createdAt ? order.createdAt.toLocaleDateString() + ' ' + order.createdAt.toLocaleTimeString() : 'N/A'}
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>${(order.total || 0).toFixed(2)}</td>
                                        <td>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className={`status-badge ${getStatusColor(order.status)}`}
                                                style={{ border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                                            >
                                                <option value="pending">Pendiente</option>
                                                <option value="processing">En Proceso</option>
                                                <option value="completed">Completado</option>
                                                <option value="cancelled">Cancelado</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-admin-primary"
                                                onClick={() => setSelectedOrder(order)}
                                                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <Eye size={16} /> Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', width: '90%' }}>
                        <div className="modal-header">
                            <h2>Detalles del Pedido</h2>
                            <button className="close-modal" onClick={() => setSelectedOrder(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <CheckCircle size={18} /> Info del Cliente
                                    </h3>
                                    <p><strong>Nombre:</strong> {selectedOrder.customer?.fullName}</p>
                                    <p><strong>Email:</strong> {selectedOrder.customer?.email}</p>
                                    <p><strong>Teléfono:</strong> {selectedOrder.customer?.phone}</p>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Package size={18} /> Envío
                                    </h3>
                                    <p><strong>Dirección:</strong> {selectedOrder.customer?.address}</p>
                                    <p><strong>Ciudad:</strong> {selectedOrder.customer?.city}</p>
                                    <p><strong>CP:</strong> {selectedOrder.customer?.zipCode}</p>
                                    {selectedOrder.customer?.notes && (
                                        <p style={{ marginTop: '10px', fontStyle: 'italic' }}>"{selectedOrder.customer.notes}"</p>
                                    )}
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Productos ({selectedOrder.items?.length || 0})</h3>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                <table className="admin-table" style={{ margin: 0 }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Precio</th>
                                            <th>Cant.</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.name}</td>
                                                <td>${Number(item.price).toFixed(2)}</td>
                                                <td>{item.quantity}</td>
                                                <td>${(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                Total: ${selectedOrder.total?.toFixed(2)}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setSelectedOrder(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSales;
