import React from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
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

    if (!isCartOpen) return null;

    return (
        <>
            <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
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
                        cartItems.map((item, index) => (
                            <div key={index} className="cart-item">
                                <div className="cart-item-info">
                                    <span className="cart-item-name">{item.name}</span>
                                    <span className="cart-item-price">
                                        ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                                    </span>
                                </div>
                                <div className="cart-item-controls">
                                    <div className="quantity-controls">
                                        <button onClick={() => updateQuantity(item.name, -1)}>
                                            <Minus size={16} />
                                        </button>
                                        <span>{item.quantity}</span>
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
                        ))
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
                        onClick={() => {
                            alert('¡Gracias por tu compra!');
                            clearCart();
                            setIsCartOpen(false);
                        }}
                    >
                        Pagar Ahora
                    </button>
                </div>
            </div>
        </>
    );
};

export default CartDrawer;
