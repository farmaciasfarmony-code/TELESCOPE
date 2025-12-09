import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AIRecommendationModal from './AIRecommendationModal';
import '../App.css';

const CartDrawer = () => {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        clearCart
    } = useCart();

    const { user } = useAuth();
    const [showRecommendations, setShowRecommendations] = useState(false);
    const navigate = useNavigate();

    if (!isCartOpen && !showRecommendations) return null;

    const handleInitialCheckoutClick = () => {
        if (!user) {
            setIsCartOpen(false);
            navigate('/login?redirect=/checkout');
            return;
        }
        // Show AI recommendations before navigating
        setShowRecommendations(true);
        // Do NOT close cart yet, or handle visibility via CSS/conditional rendering
    };

    const handleFinalCheckout = () => {
        setShowRecommendations(false);
        setIsCartOpen(false);
        navigate('/checkout');
    };

    return (
        <>
            {isCartOpen && <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />}
            {isCartOpen && (
                <div className="cart-drawer">
                    <div className="cart-header">
                        <h3>Tu Carrito</h3>
                        <button className="close-cart" onClick={() => setIsCartOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="cart-items">
                        {cartItems.length === 0 ? (
                            <div className="empty-cart">
                                <p>Tu carrito está vacío</p>
                            </div>
                        ) : (
                            cartItems.map((item, index) => {
                                if (!item) return null;
                                return (
                                    <div key={index} className="cart-item">
                                        <Link to={`/product/${item.id}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}>
                                            {item.image && (
                                                <div className="cart-item-image" style={{ width: '50px', height: '50px', marginRight: '10px', flexShrink: 0 }}>
                                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                                </div>
                                            )}
                                            <div className="cart-item-info">
                                                <span className="cart-item-name">{item.name || 'Producto sin nombre'}</span>
                                                <span className="cart-item-price">
                                                    ${Number(item.price || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </Link>
                                        <div className="cart-item-controls">
                                            <div className="quantity-controls">
                                                <button onClick={() => updateQuantity(item.name, -1)}>
                                                    <Minus size={16} />
                                                </button>
                                                <span>{item.quantity || 1}</span>
                                                <button onClick={() => updateQuantity(item.name, 1)}>
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <button
                                                className="remove-item"
                                                onClick={() => removeFromCart(item.name)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total:</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button
                            className="checkout-btn"
                            disabled={cartItems.length === 0}
                            onClick={handleInitialCheckoutClick}
                        >
                            Pagar Ahora
                        </button>
                    </div>
                </div>
            )}

            <AIRecommendationModal
                isOpen={showRecommendations}
                onClose={() => setShowRecommendations(false)}
                onProceed={handleFinalCheckout}
            />
        </>
    );
};

export default CartDrawer;
