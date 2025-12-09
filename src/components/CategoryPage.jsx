import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Plus, ArrowLeft, Heart } from 'lucide-react';
import '../App.css';

const CategoryPage = () => {
    const { categoryName } = useParams();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { products, loading } = useProducts();

    // Decode URI component to handle spaces and special characters
    const decodedCategoryName = decodeURIComponent(categoryName);

    console.log("CategoryPage: decodedCategoryName", decodedCategoryName);
    console.log("CategoryPage: all products received", products.length);

    let categoryProducts = [];
    if (!loading) {
        if (decodedCategoryName === 'Ofertas' || decodedCategoryName === 'ofertas') {
            categoryProducts = products.filter(p => p.discount);
        } else {
            categoryProducts = products.filter(
                product => {
                    // Robust comparison ignoring whitespace
                    const productCat = product.category ? product.category.trim() : '';
                    return productCat === decodedCategoryName.trim();
                }
            );
        }
        console.log("CategoryPage: filtered products", categoryProducts.length);
    }

    if (loading) return <div className="p-8 text-center">Cargando productos...</div>;

    return (
        <div className="category-page">
            <div className="category-header">
                <Link to="/" className="back-link">
                    <ArrowLeft size={20} /> Volver al Inicio
                </Link>
                <h1>{decodedCategoryName}</h1>
            </div>

            <div className="product-grid">
                {categoryProducts.length > 0 ? (
                    categoryProducts.map(product => (
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
                                        <div className="placeholder-icon" style={{ fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f1f5f9' }}>💊</div>
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
                                <span className="product-price">${product.price.toFixed(2)}</span>
                                <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                                    <Plus size={16} /> Agregar
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No se encontraron productos en esta categoría.</p>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
