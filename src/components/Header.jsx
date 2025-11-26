import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, User, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import '../App.css';
import logo from '../assets/logo.jpg';

const Header = () => {
    const { setIsCartOpen, cartCount, addToCart } = useCart();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const itemRefs = useRef([]);

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term.length > 1) {
            const results = products.filter(product =>
                product.name.toLowerCase().includes(term.toLowerCase()) ||
                product.category.toLowerCase().includes(term.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(term.toLowerCase()))
            );
            setSearchResults(results);
            setActiveIndex(0);
            setShowResults(true);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    };

    useEffect(() => {
        // Ensure refs array matches results length
        itemRefs.current = itemRefs.current.slice(0, searchResults.length);
    }, [searchResults.length]);

    useEffect(() => {
        // Scroll highlighted item into view when activeIndex changes
        const el = itemRefs.current[activeIndex];
        if (el && typeof el.scrollIntoView === 'function') {
            el.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    const handleKeyDown = (e) => {
        if (!showResults || searchResults.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % searchResults.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => (i - 1 + searchResults.length) % searchResults.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const product = searchResults[activeIndex];
            if (product) {
                addToCart(product);
            }
        } else if (e.key === 'Escape') {
            setShowResults(false);
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setShowResults(false);
    };

    

    return (
        <header className="header">
            <div className="top-bar">
                <div className="top-bar-container">
                    <a href="#">Ayuda</a>
                    <a href="#">Contacto</a>
                    <a href="#">Sucursales</a>
                </div>
            </div>

            <div className="header-main">
                <div className="header-container">
                    <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={logo} alt="Farmony" style={{ height: '60px' }} />
                    </Link>

                    <div className="search-container" style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
                        <div className="search-bar">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="¿Qué estás buscando hoy?"
                                value={searchTerm}
                                onChange={handleSearch}
                                onKeyDown={handleKeyDown}
                            />
                            {searchTerm && (
                                <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.5rem' }}>
                                    <X size={16} color="gray" />
                                </button>
                            )}
                            <button className="search-btn">Buscar</button>
                        </div>

                        {showResults && (
                            <div className="search-results" style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: 'white',
                                boxShadow: 'var(--shadow-lg)',
                                borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                                zIndex: 1001,
                                maxHeight: '400px',
                                overflowY: 'auto',
                                border: '1px solid #eee'
                            }}>
                                {searchResults.length > 0 ? (
                                    searchResults.map((product, index) => (
                                        <div
                                            key={product.id}
                                            ref={el => itemRefs.current[index] = el}
                                            onMouseEnter={() => setActiveIndex(index)}
                                            className="search-result-item"
                                            style={{
                                                padding: '1rem',
                                                borderBottom: '1px solid #eee',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: index === activeIndex ? 'rgba(0,0,0,0.03)' : 'transparent'
                                            }}
                                        >
                                            <div style={{ cursor: 'pointer' }} onClick={() => { window.location.href = `/category/${encodeURIComponent(product.category)}`; }}>
                                                <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{product.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{product.category}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                                                    ${product.price.toFixed(2)}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(product);
                                                    }}
                                                    style={{
                                                        background: 'var(--primary-color)',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0.4rem 0.7rem',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Agregar
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No se encontraron productos
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="nav-actions">
                        <Link to="/" className="nav-action-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                            <span>Inicio</span>
                        </Link>
                        <Link to="/account" className="nav-action-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                            <User size={24} />
                            <span>Mi Cuenta</span>
                        </Link>
                        <button className="nav-action-btn" onClick={() => setIsCartOpen(true)}>
                            <div style={{ position: 'relative' }}>
                                <ShoppingBag size={24} />
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </div>
                            <span>Carrito</span>
                        </button>
                    </div>
                </div>
            </div>

            <nav className="nav-categories">
                    <div className="nav-categories-container">
                        <Link to={`/`} className="category-link">Inicio</Link>
                        <Link to={`/category/${encodeURIComponent('Medicamentos')}`} className="category-link">Medicamentos</Link>
                        <Link to={`/category/${encodeURIComponent('Higiene')}`} className="category-link">Higiene y Belleza</Link>
                        <Link to={`/category/${encodeURIComponent('Bebés')}`} className="category-link">Bebés</Link>
                        <Link to={`/category/${encodeURIComponent('Vitaminas')}`} className="category-link">Vitaminas</Link>
                        <Link to={`/category/${encodeURIComponent('Alimentos')}`} className="category-link">Alimentos</Link>
                        <Link to={`/category/${encodeURIComponent('Ofertas')}`} className="category-link">Ofertas</Link>
                    </div>
                </nav>
        </header>
    );
};

export default Header;
