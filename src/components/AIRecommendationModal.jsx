import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles, ShoppingBag, BrainCircuit, Bot } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import './AIRecommendationModal.css';

const CORRELATIONS = {
    'Medicamentos': ['Suplementos', 'Alimentos', 'Higiene'],
    'Higiene': ['Belleza', 'Limpieza', 'Bebés'],
    'Bebés': ['Higiene', 'Alimentos', 'Medicamentos'],
    'Suplementos': ['Alimentos', 'Medicamentos', 'Belleza'],
    'Alimentos': ['Suplementos', 'Bebés', 'Limpieza'],
    'Limpieza': ['Higiene', 'Ofertas', 'Alimentos'],
    'Belleza': ['Higiene', 'Suplementos', 'Ofertas']
};

const getFarmyAdvice = (category, product) => {
    if (!product) return "He encontrado algunas ofertas especiales para ti.";

    switch (category) {
        case 'Medicamentos':
            return `Veo que llevas productos de salud. 🩺 Te sugiero ${product.name}, ya que es excelente para prevenir malestares o complementar tu tratamiento.`;
        case 'Belleza':
            return `¡Tu cuidado personal es importante! ✨ Para una rutina completa, te recomiendo agregar ${product.name}. ¡Te encantará!`;
        case 'Higiene':
            return `Para mantener tu higiene impecable 🚿, este ${product.name} es el compañero perfecto de lo que ya llevas.`;
        case 'Bebés':
            return `Pensando en tu bebé 👶: Muchos padres que llevan lo mismo que tú, también agregan ${product.name}.`;
        case 'Suplementos':
            return `¡Vas por buen camino con tu salud! 💪 Para maximizar tu bienestar, ${product.name} es una gran adición.`;
        case 'Alimentos':
            return `¿Un antojo saludable? 🍎 Este ${product.name} combina perfecto con tus alimentos.`;
        default:
            return `Analizando tu carrito 🛒, creo que ${product.name} es justo lo que te falta hoy.`;
    }
};

const AIRecommendationModal = ({ isOpen, onClose, onProceed }) => {
    const { cartItems, addToCart } = useCart();
    const { products } = useProducts();
    const [recommendations, setRecommendations] = useState([]);
    const [reason, setReason] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setIsAnalyzing(true);
        setRecommendations([]);

        const timer = setTimeout(() => {
            if (products.length === 0) {
                setIsAnalyzing(false);
                return;
            }

            // 1. Analyze Cart Categories
            const cartCategories = cartItems.map(item => item.category);
            const cartIds = cartItems.map(item => item.id);
            let recommended = [];

            // Find most frequent category
            const categoryCounts = cartCategories.reduce((acc, curr) => {
                acc[curr] = (acc[curr] || 0) + 1;
                return acc;
            }, {});

            const keys = Object.keys(categoryCounts);
            keys.sort((a, b) => categoryCounts[b] - categoryCounts[a]);
            const topCategory = keys[0];

            if (topCategory) {
                const relatedCategories = CORRELATIONS[topCategory] || [];
                for (const relatedCat of relatedCategories) {
                    const found = products.filter(p => p.category === relatedCat && !cartIds.includes(p.id));
                    if (found.length > 0) {
                        recommended.push(...found.slice(0, 2));
                    }
                    if (recommended.length >= 3) break;
                }

                if (recommended.length < 3) {
                    const sameCat = products.filter(p => p.category === topCategory && !cartIds.includes(p.id));
                    recommended.push(...sameCat.slice(0, 3 - recommended.length));
                }
            } else {
                recommended = products.filter(p => p.trending).slice(0, 3);
            }

            // Deduplicate
            recommended = [...new Set(recommended)];
            const finalRecs = recommended.slice(0, 3);

            setRecommendations(finalRecs);
            setReason(getFarmyAdvice(topCategory, finalRecs[0]));
            setIsAnalyzing(false);

        }, 1500);

        return () => clearTimeout(timer);
    }, [isOpen, cartItems, products]);

    if (!isOpen) return null;

    return (
        <div className="ai-modal-overlay">
            <div className="ai-modal-content">
                <button className="ai-modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                {isAnalyzing ? (
                    <div className="ai-analyzing-state" style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1.5rem' }}>
                            <div style={{ position: 'absolute', inset: 0, border: '4px solid #f3f4f6', borderRadius: '50%' }}></div>
                            <div style={{ position: 'absolute', inset: 0, border: '4px solid #3b82f6', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                            <Bot size={40} color="#3b82f6" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', color: '#1f2937', marginBottom: '0.5rem' }}>Farmy está analizando tu carrito... 🤖</h3>
                        <p style={{ color: '#6b7280' }}>Buscando las mejores recomendaciones para ti.</p>
                        <style>{`
                            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                        `}</style>
                    </div>
                ) : (
                    <>
                        <div className="ai-modal-header">
                            <div className="ai-icon-wrapper">
                                <Bot size={32} className="ai-icon" />
                            </div>
                            <h2>Sugerencia de Farmy</h2>
                            <p className="farmy-advice-text" style={{ fontSize: '1rem', color: '#4b5563', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                "{reason}"
                            </p>
                        </div>

                        <div className="ai-recommendations-list">
                            {recommendations.map(product => (
                                <div key={product.id} className="ai-product-card">
                                    <Link to={`/product/${product.id}`} target="_blank" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', flex: 1 }}>
                                        {product.image ? (
                                            <div style={{ width: '60px', height: '60px', marginRight: '1rem', flexShrink: 0 }}>
                                                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px', background: '#f9fafb' }} />
                                            </div>
                                        ) : (
                                            <div style={{ width: '60px', height: '60px', marginRight: '1rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '8px', fontSize: '1.5rem' }}>💊</div>
                                        )}
                                        <div className="ai-product-info">
                                            <h4>{product.name}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span className="ai-product-price">${product.price.toFixed(2)}</span>
                                                {product.discount > 0 && <span style={{ fontSize: '0.75rem', color: '#ef4444', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>-{product.discount}%</span>}
                                            </div>
                                        </div>
                                    </Link>
                                    <button
                                        className="ai-add-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product);
                                        }}
                                    >
                                        <ShoppingBag size={16} />
                                        Agregar
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="ai-modal-footer">
                            <button className="btn-secondary" onClick={onClose}>
                                No, gracias
                            </button>
                            <button className="btn-primary" onClick={onProceed}>
                                Continuar al Pago
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AIRecommendationModal;
