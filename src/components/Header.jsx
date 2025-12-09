import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';
import { useTheme } from '../context/ThemeContext';
import '../App.css';
import logo from '../assets/logo.jpg';

const Header = () => {
    // setIsCartOpen se importa para abrir el carrito cuando se hace clic en el ícono.
    const { cartCount, addToCart } = useCart();
    const { products } = useProducts();
    const { theme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
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
            setActiveIndex(-1);
            setShowResults(true);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    };

    // NUEVA FUNCIÓN: Agrega el producto Y limpia los resultados
    const handleAddToCartAndClear = (product) => {
        addToCart(product);
        // 1. Limpia los resultados, cerrando la ventana de búsqueda (lo que el usuario pidió)
        setSearchResults([]);
        setSearchTerm(''); // También limpiamos la barra de texto
        setShowResults(false);
        // 2. Opcional: Puedes dejar un pequeño indicador visual de éxito aquí si lo deseas.
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

    const navigate = useNavigate();

    const handleSearchSubmit = () => {
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setShowResults(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (!showResults || searchResults.length === 0)) {
            handleSearchSubmit();
            return;
        }
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
                handleAddToCartAndClear(product);
            } else {
                handleSearchSubmit();
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
                    <Link to="/faq">Ayuda</Link>
                    <Link to="/contact">Contacto</Link>
                    <Link to="/stores">Sucursales</Link>
                    <Link to="/admin/login" style={{ fontWeight: 'bold', color: '#3b82f6', marginLeft: '1rem' }}>Admin Panel</Link>
                </div>
            </div>

            <div className="header-main">
                <div className="header-container">
                    <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={theme?.logo || logo} alt={theme?.siteName || "Farmony"} style={{ height: '90px' }} />
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
                            <button className="search-btn" onClick={handleSearchSubmit}>Buscar</button>
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
                                                        // LLAMAMOS A LA NUEVA FUNCIÓN PARA CERRAR LA VENTANA
                                                        handleAddToCartAndClear(product);
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
                        <Link to="/cart" className="nav-action-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ position: 'relative' }}>
                                <ShoppingBag size={24} />
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </div>
                            <span>Carrito</span>
                        </Link>
                    </div>
                </div>
            </div>

            <nav className="nav-categories">
                <div className="nav-categories-container">
                    <Link to={`/`} className="category-link">Inicio</Link>
                    <Link to={`/category/${encodeURIComponent('Medicamentos')}`} className="category-link">Medicamentos</Link>
                    <Link to={`/category/${encodeURIComponent('Higiene')}`} className="category-link">Higiene y Belleza</Link>
                    <Link to={`/category/${encodeURIComponent('Bebés')}`} className="category-link">Bebés</Link>
                    <Link to={`/category/${encodeURIComponent('Suplementos')}`} className="category-link">Suplementos</Link>
                    <Link to={`/category/${encodeURIComponent('Alimentos')}`} className="category-link">Alimentos</Link>
                    <Link to={`/category/${encodeURIComponent('Limpieza')}`} className="category-link">Limpieza</Link>
                    <Link to={`/category/${encodeURIComponent('Ofertas')}`} className="category-link">Ofertas</Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;