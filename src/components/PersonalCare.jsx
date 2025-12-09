import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart, Plus } from 'lucide-react';
import '../App.css';

const PersonalCare = () => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { products, loading } = useProducts();

    if (loading) return <div className="text-center py-8">Cargando productos...</div>;

    const personalCareProducts = products.filter(p => p.category === 'Cuidado Personal');

    return (
        <section className="personal-care-section">
            <h2 className="section-title">Cuidado Personal</h2>
            <div className="personal-intro" style={{ marginBottom: '1rem' }}>
                <p>Encuentra productos esenciales para tu higiene y cuidado diario: cremas, rastrillos, geles y más.</p>
            </div>
            <div className="product-grid">
                {personalCareProducts.map(product => (
                    <div key={product.id} className="product-card" style={{ position: 'relative' }}>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isInWishlist(product.id)) {
                                    removeFromWishlist(product.id);
                                } else {
                                    addToWishlist(product);
                                }
                            }}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                padding: '8px',
                                cursor: 'pointer',
                                zIndex: 10,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title={isInWishlist(product.id) ? "Eliminar de favoritos" : "Agregar a favoritos"}
                        >
                            <Heart
                                size={18}
                                color={isInWishlist(product.id) ? "#ef4444" : "#94a3b8"}
                                fill={isInWishlist(product.id) ? "#ef4444" : "none"}
                            />
                        </button>

                        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                            <div className="product-image-placeholder">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <Heart size={48} color="var(--primary-color)" /> // Mantener placeholder existente por si acaso
                                )}
                            </div>
                        </Link>
                        <div className="product-info">
                            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <h3>{product.name}</h3>
                            </Link>
                            <p className="product-description">{product.description}</p>
                            <span className="product-price">${product.price.toFixed(2)}</span>
                            <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                                <Plus size={16} /> Agregar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PersonalCare;
