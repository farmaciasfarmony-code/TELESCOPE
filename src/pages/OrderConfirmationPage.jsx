import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle, Package, Home, Printer } from 'lucide-react';
import './OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const docRef = doc(db, 'orders', orderId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("No such order!");
                }
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="confirmation-container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="confirmation-container">
                <div className="confirmation-header">
                    <h1 className="confirmation-title">Pedido no encontrado</h1>
                    <p className="confirmation-subtitle">Lo sentimos, no pudimos encontrar la información de este pedido.</p>
                </div>
                <Link to="/" className="btn-primary">Volver al Inicio</Link>
            </div>
        );
    }

    return (
        <div className="confirmation-container">
            <div className="confirmation-header">
                <CheckCircle size={64} className="success-icon" />
                <h1 className="confirmation-title">¡Gracias por tu compra!</h1>
                <p className="confirmation-subtitle">Tu pedido ha sido confirmado y está siendo procesado.</p>
            </div>

            <div className="order-details-card">
                <div className="order-info-grid">
                    <div className="info-group">
                        <h3>Número de Pedido</h3>
                        <p>#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="info-group">
                        <h3>Fecha</h3>
                        <p>{order.createdAt?.toDate().toLocaleDateString()}</p>
                    </div>
                    <div className="info-group">
                        <h3>Total</h3>
                        <p>${order.total.toFixed(2)}</p>
                    </div>
                    <div className="info-group">
                        <h3>Método de Pago</h3>
                        <p>{order.paymentMethod === 'cash_on_delivery' ? 'Pago contra entrega' : order.paymentMethod}</p>
                    </div>
                </div>

                <div className="order-items-list">
                    <h3>Resumen de Artículos</h3>
                    {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                            {item.image && (
                                <div style={{ width: '50px', height: '50px', marginRight: '1rem', flexShrink: 0 }}>
                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                </div>
                            )}
                            <div className="item-info">
                                <span className="item-name">{item.name}</span>
                                <span className="item-qty">Cantidad: {item.quantity}</span>
                            </div>
                            <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="order-total">
                    <span>Total Pagado</span>
                    <span>${order.total.toFixed(2)}</span>
                </div>
            </div>

            <div className="confirmation-actions">
                <Link to="/" className="btn-primary">
                    <Home size={20} />
                    Volver al Inicio
                </Link>
                <button onClick={() => window.print()} className="btn-secondary">
                    <Printer size={20} />
                    Imprimir Recibo
                </button>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
