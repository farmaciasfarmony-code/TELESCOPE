import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShieldCheck } from 'lucide-react';
import AIRecommendationModal from '../components/AIRecommendationModal';
import '../App.css';
import './CartPage.css';

// Sub-componente para manejar el estado local del input
const CartItem = ({ item, updateQuantity, removeFromCart }) => {
    // Prefer ID, ensures we target the right item
    // const identifier = item.id || item.name; // This is no longer needed as we pass both id and name

    // Strict pricing for display
    const unitPrice = parseFloat(item.price) || 0;
    const qty = parseInt(item.quantity) || 1;
    const lineTotal = (unitPrice * qty).toFixed(2);

    const handleBlur = (e) => {
        const val = e.target.value;
        const num = parseInt(val);
        const input = e.target;

        // Force reset wrapper
        const performReset = () => {
            if (input) input.value = qty;
        };

        if (!isNaN(num) && num >= 1) {
            if (num !== qty) {
                console.log(`[CartItem] Requesting update: ${item.name} -> ${num}`);
                try {
                    // Safe call using ID and Name
                    updateQuantity(item.id, item.name, num);
                } catch (err) {
                    console.error("[CartItem] Update crashed:", err);
                }
            }
        }

        // PESSIMISTIC RESET:
        // Use timeout to override any React render concurrency
        setTimeout(performReset, 50);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    return (
        <div className="cart-item-card">
            <style>{`
                @media (min-width: 768px) { .item-controls-mobile { display: none !important; } }
                @media (max-width: 767px) { .desktop-only { display: none !important; } }
            `}</style>
            <div className="cart-item-image">
                {item.image ? (
                    <img src={item.image} alt={item.name} />
                ) : (
                    <div className="placeholder-icon">💊</div>
                )}
            </div>

            <div className="cart-item-details">
                <div className="item-price-unit" style={{ fontSize: '0.9rem', color: '#2563eb', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Unitario: ${unitPrice.toFixed(2)}
                    {/* Debug ID helper */}
                    <span style={{ fontSize: '10px', color: '#ccc', marginLeft: '5px' }} title="ID Interno">#{String(item.id).substring(0, 6)}</span>
                </div>
                <Link to={`/product/${item.id}`} className="item-name-link">
                    <h3>{item.name}</h3>
                </Link>
                <p className="item-status">Disponible</p>
                <div className="item-controls-mobile">
                    <div className="quantity-selector">
                        <button onClick={() => updateQuantity(item.id, item.name, qty - 1)} disabled={qty <= 1}>
                            <Minus size={16} />
                        </button>
                        <input
                            key={`mobile-input-${qty}`}
                            type="number"
                            min="1"
                            defaultValue={qty}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="quantity-input"
                        />
                        <button onClick={() => updateQuantity(item.id, item.name, qty + 1)}>
                            <Plus size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="cart-item-price-actions">
                <div className="item-price">
                    ${lineTotal}
                </div>

                <div className="quantity-selector desktop-only">
                    <button onClick={() => updateQuantity(item.id, item.name, qty - 1)} disabled={qty <= 1}>
                        <Minus size={16} />
                    </button>
                    <input
                        key={`desktop-input-${qty}`}
                        type="number"
                        min="1"
                        defaultValue={qty}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="quantity-input"
                    />
                    <button onClick={() => updateQuantity(item.id, item.name, qty + 1)}>
                        <Plus size={16} />
                    </button>
                </div>

                <button onClick={() => removeFromCart(item.id, item.name)} className="btn-remove">
                    <Trash2 size={18} /> Eliminar
                </button>
            </div>
        </div>
    );
};

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, cartCount } = useCart();

    // Debug: Check exactly what the Cart Page is seeing
    console.table(cartItems);

    const navigate = useNavigate();
    const [showAIModal, setShowAIModal] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Calculate total locally to ensure visual consistency with rendered items
    const safeCartTotal = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        return sum + (price * qty);
    }, 0);

    const handleProceedToCheckout = () => {
        setShowAIModal(true);
    };

    const handleAIProceed = () => {
        setShowAIModal(false);
        navigate('/checkout');
    };

    const handleForceReset = () => {
        if (window.confirm("¿Estás seguro? Esto borrará tu carrito actual para corregir errores de caché.")) {
            localStorage.removeItem('cart');
            localStorage.removeItem('cart_version');
            window.location.reload();
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-page-container empty">
                <div className="empty-cart-content">
                    <div className="empty-icon-wrapper">
                        <div className="cart-icon">🛒</div>
                        <div className="sparkle-1">✨</div>
                        <div className="sparkle-2">✨</div>
                    </div>
                    <h2>Tu carrito está vacío (v3.1)</h2>
                    <p>¡Explora nuestros productos y encuentra lo que necesitas para tu bienestar!</p>
                    <Link to="/" className="btn-explore">
                        Explorar Productos
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <div className="cart-header">
                <Link to="/" className="back-link">
                    <ArrowLeft size={20} />
                    <span>Seguir Comprando</span>
                </Link>
                <h2>Tu Carrito <span style={{ fontSize: '0.6em', color: '#aaa' }}>(v3.1)</span></h2>
            </div>
            <div className="cart-layout">
                {/* Left Column: Product List */}
                <div className="cart-items-list">
                    {cartItems.map((item, index) => (
                        <CartItem
                            key={`${item.id || item.name}-${index}`}
                            item={item}
                            updateQuantity={updateQuantity}
                            removeFromCart={removeFromCart}
                        />
                    ))}
                </div>

                {/* Right Column: Order Summary */}
                <div className="cart-summary-sidebar">
                    <div className="summary-card">
                        <h3>Resumen del Pedido</h3>
                        <div className="summary-row">
                            <span>Subtotal ({cartCount} productos):</span>
                            <span className="summary-amount">${safeCartTotal.toFixed(2)}</span>
                        </div>

                        <div className="summary-total">
                            <span>Total:</span>
                            <span className="total-amount">${safeCartTotal.toFixed(2)}</span>
                        </div>

                        <button onClick={handleProceedToCheckout} className="btn-checkout-full">
                            Proceder al Pago
                        </button>

                        <div className="security-note">
                            <ShieldCheck size={16} />
                            <span>Compra 100% Segura y Protegida</span>
                        </div>

                        <button onClick={handleForceReset} className="text-xs text-red-500 mt-4 underline">
                            ⚠ Resetear Carrito (Si falla)
                        </button>
                    </div>

                    <Link to="/" className="continue-shopping">
                        <ArrowLeft size={16} /> Seguir Comprando
                    </Link>
                </div>
            </div>

            <AIRecommendationModal
                isOpen={showAIModal}
                onClose={handleAIProceed}
                onProceed={handleAIProceed}
            />
        </div>
    );
};

export default CartPage;
