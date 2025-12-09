import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Plus, Tag, Heart } from 'lucide-react';
import '../App.css';

const SpecialOffers = () => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { products, loading } = useProducts();

    if (loading) return <div className="text-center py-8">Cargando ofertas...</div>;

    const discountedProducts = products.filter(product => product.discount);

    return (
        <section className="special-offers-section" id="ofertas">
            <h2 className="section-title">Ofertas Especiales</h2>
            <div className="product-grid">
                {discountedProducts.map(product => {
                    const discountedPrice = product.price * (1 - product.discount / 100);
                    return (
                        <div key={product.id} className="product-card offer-card" style={{ position: 'relative' }}>
                            <div className="discount-badge">-{product.discount}%</div>

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
                                        <Tag size={48} color="var(--secondary-color)" />
                                    )}
                                </div>
                            </Link>
                            <div className="product-info">
                                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <h3>{product.name}</h3>
                                </Link>
                                <p className="product-description">{product.description}</p>
                                <Link to={`/product/${product.id}`} className="view-details-link">
                                    Ver detalles
                                </Link>
                                <div className="price-container">
                                    <span className="original-price">${product.price.toFixed(2)}</span>
                                    <span className="discounted-price">${discountedPrice.toFixed(2)}</span>
                                </div>
                                <button className="add-to-cart-btn" onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addToCart(product);
                                }}>
                                    <Plus size={16} /> Agregar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default SpecialOffers;
