import React from 'react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { Heart, Plus } from 'lucide-react';
import '../App.css';

const PersonalCare = () => {
    const { addToCart } = useCart();
    const personalCareProducts = products.filter(p => p.category === 'Cuidado Personal');

    return (
        <section className="personal-care-section">
            <h2 className="section-title">Cuidado Personal</h2>
            <div className="personal-intro" style={{marginBottom: '1rem'}}>
                <p>Encuentra productos esenciales para tu higiene y cuidado diario: cremas, rastrillos, geles y más.</p>
            </div>
            <div className="product-grid">
                {personalCareProducts.map(product => (
                    <div key={product.id} className="product-card">
                        <div className="product-image-placeholder">
                            <Heart size={48} color="var(--primary-color)" />
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

export default PersonalCare;
