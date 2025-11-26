import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { Plus, ArrowLeft } from 'lucide-react';
import '../App.css';

const CategoryPage = () => {
    const { categoryName } = useParams();
    const { addToCart } = useCart();

    // Decode URI component to handle spaces and special characters
    const decodedCategoryName = decodeURIComponent(categoryName);

    let categoryProducts = [];
    if (decodedCategoryName === 'Ofertas' || decodedCategoryName === 'ofertas') {
        categoryProducts = products.filter(p => p.discount);
    } else {
        categoryProducts = products.filter(
            product => product.category === decodedCategoryName
        );
    }

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
                        <div key={product.id} className="product-card">
                            <div className="product-image-placeholder">
                                <img src={`https://via.placeholder.com/150?text=${product.name}`} alt={product.name} />
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
                    ))
                ) : (
                    <p>No se encontraron productos en esta categoría.</p>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
