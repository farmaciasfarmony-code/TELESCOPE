import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Filter, SlidersHorizontal, ShoppingCart, Eye, Heart } from 'lucide-react';
import '../App.css';
import './SearchPage.css';

const SearchPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { products, loading } = useProducts();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    // Parse query param
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || '';

    const [filteredProducts, setFilteredProducts] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('relevance');

    // Extract unique categories for filter
    const categories = ['All', ...new Set(products.map(p => p.category))];

    useEffect(() => {
        if (loading) return;

        let results = products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.description?.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase())
        );

        // Apply Category Filter
        if (selectedCategory !== 'All') {
            results = results.filter(p => p.category === selectedCategory);
        }

        // Apply Price Filter
        results = results.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

        // Apply Sorting
        if (sortBy === 'price-asc') {
            results.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
            results.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'name-asc') {
            results.sort((a, b) => a.name.localeCompare(b.name));
        }

        setFilteredProducts(results);
    }, [query, products, loading, selectedCategory, priceRange, sortBy]);

    if (loading) return <div className="p-8 text-center">Cargando resultados...</div>;

    return (
        <div className="search-page-container">
            <div className="search-header">
                <h1>Resultados para: <span className="highlight">"{query}"</span></h1>
                <p>{filteredProducts.length} productos encontrados</p>
            </div>

            <div className="search-layout">
                {/* Filters Sidebar */}
                <aside className="filters-sidebar">
                    <div className="filter-group">
                        <h3><Filter size={18} /> Categorías</h3>
                        <div className="category-list">
                            {categories.map(cat => (
                                <label key={cat} className="filter-checkbox">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={selectedCategory === cat}
                                        onChange={() => setSelectedCategory(cat)}
                                    />
                                    <span>{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3><SlidersHorizontal size={18} /> Precio</h3>
                        <div className="price-inputs">
                            <input
                                type="number"
                                placeholder="Min"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                            />
                            <span>-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </aside>

                {/* Results Grid */}
                <main className="results-content">
                    <div className="results-toolbar">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="relevance">Relevancia</option>
                            <option value="price-asc">Precio: Menor a Mayor</option>
                            <option value="price-desc">Precio: Mayor a Menor</option>
                            <option value="name-asc">Nombre: A-Z</option>
                        </select>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="no-results">
                            <p>No encontramos productos que coincidan con tu búsqueda.</p>
                            <button onClick={() => {
                                setSelectedCategory('All');
                                setPriceRange({ min: 0, max: 1000 });
                            }} className="btn-secondary">
                                Limpiar Filtros
                            </button>
                        </div>
                    ) : (
                        <div className="product-grid">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="product-card">
                                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                        <div className="product-image-placeholder">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <div className="placeholder-icon">💊</div>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="product-info">
                                        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <h3>{product.name}</h3>
                                        </Link>
                                        <p className="category-tag">{product.category}</p>
                                        <div className="price-row">
                                            <span className="price">${product.price.toFixed(2)}</span>
                                            <button
                                                className="btn-add-mini"
                                                onClick={() => addToCart(product)}
                                            >
                                                <ShoppingCart size={16} />
                                            </button>
                                            <button
                                                className={`btn-add-mini ${isInWishlist(product.id) ? 'wishlist-active' : ''}`}
                                                onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                                                style={{ marginLeft: '0.5rem', background: isInWishlist(product.id) ? '#fee2e2' : '#f1f5f9', color: isInWishlist(product.id) ? '#ef4444' : '#64748b' }}
                                            >
                                                <Heart size={16} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SearchPage;
