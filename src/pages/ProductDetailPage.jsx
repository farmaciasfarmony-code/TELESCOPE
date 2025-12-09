import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Heart, Check, AlertCircle, Info } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getProductById, loading: productsLoading } = useProducts();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            const foundProduct = await getProductById(id);
            setProduct(foundProduct);
            setLoading(false);
        };

        if (id) {
            fetchProduct();
        }
    }, [id, getProductById]);

    if (loading || productsLoading) {
        return (
            <div className="product-detail-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-container" style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Producto no encontrado</h2>
                <p>Lo sentimos, el producto que buscas no existe o ha sido eliminado.</p>
                <Link to="/" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    Volver al Inicio
                </Link>
            </div>
        );
    }

    const discountedPrice = product.discount
        ? product.price * (1 - product.discount / 100)
        : product.price;

    const inWishlist = isInWishlist(product.id);

    return (
        <div className="product-detail-container">
            <button onClick={() => navigate(-1)} className="back-link">
                <ArrowLeft size={20} /> Volver
            </button>

            <div className="product-detail-grid">
                {/* Left Column: Image */}
                <div className="product-gallery">
                    <div className="main-image-container">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="main-image"
                                style={{ maxHeight: '300px', maxWidth: '90%', objectFit: 'contain' }}
                            />
                        ) : (
                            <div className="placeholder-detail-icon">💊</div>
                        )}
                    </div>
                </div>

                {/* Right Column: Info */}
                <div className="product-info-section">
                    <span className="product-category-badge">{product.category}</span>

                    <h1 className="product-title-large">{product.name}</h1>

                    <div className="product-price-large">
                        ${discountedPrice.toFixed(2)}
                        {product.discount > 0 && (
                            <>
                                <span className="original-price-large">${product.price.toFixed(2)}</span>
                                <span className="discount-tag-large">-{product.discount}%</span>
                            </>
                        )}
                    </div>

                    <div className="stock-status">
                        {product.stock > 0 ? (
                            <span className="in-stock"><Check size={16} /> Disponible en stock ({product.stock})</span>
                        ) : (
                            <span className="out-of-stock"><AlertCircle size={16} /> Agotado</span>
                        )}
                    </div>

                    <div className="product-description-container">
                        <h3 className="description-heading">
                            <Info size={20} className="description-icon" />
                            Detalles del Producto
                        </h3>
                        <p className="product-description-full">
                            {product.description || "Sin descripción disponible para este producto."}
                        </p>
                    </div>

                    <div className="action-buttons">
                        <button
                            className="btn-add-cart-large"
                            onClick={() => addToCart(product)}
                            disabled={product.stock <= 0}
                        >
                            <ShoppingBag size={24} />
                            {product.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
                        </button>

                        <button
                            className={`btn-wishlist-large ${inWishlist ? 'active' : ''}`}
                            onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}
                        >
                            <Heart size={24} fill={inWishlist ? "currentColor" : "none"} />
                            {inWishlist ? 'En Lista de Deseos' : 'Guardar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
