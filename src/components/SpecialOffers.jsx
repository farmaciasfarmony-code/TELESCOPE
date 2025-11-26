import React from 'react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { Plus, Tag } from 'lucide-react';
import '../App.css';

const SpecialOffers = () => {
    const { addToCart } = useCart();
    const discountedProducts = products.filter(product => product.discount);

    return (
        <section className="special-offers-section" id="ofertas">
            <h2 className="section-title">Ofertas Especiales</h2>
            <div className="product-grid">
                {discountedProducts.map(product => {
                    const discountedPrice = product.price * (1 - product.discount / 100);
                    return (
                        <div key={product.id} className="product-card offer-card">
                            <div className="discount-badge">-{product.discount}%</div>
                            <div className="product-image-placeholder">
                                <Tag size={48} color="var(--secondary-color)" />
                            </div>
                            <div className="product-info">
                                <h3>{product.name}</h3>
                                <p className="product-description">{product.description}</p>
                                <div className="price-container">
                                    <span className="original-price">${product.price.toFixed(2)}</span>
                                    <span className="discounted-price">${discountedPrice.toFixed(2)}</span>
                                </div>
                                <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
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
