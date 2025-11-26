import React from 'react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { Plus, TrendingUp } from 'lucide-react';
import '../App.css';

const TrendingProducts = () => {
    const { addToCart } = useCart();
    const trendingProducts = products.filter(product => product.trending);

    return (
        <section className="trending-section">
            <h2 className="section-title">Productos en Tendencia</h2>
            <div className="product-grid">
                {trendingProducts.map(product => (
                    <div key={product.id} className="product-card">
                        <div className="product-image-placeholder">
                            <TrendingUp size={48} color="var(--primary-color)" />
                        </div>
                        <div className="product-info">
                            <h3>{product.name}</h3>
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

export default TrendingProducts;
