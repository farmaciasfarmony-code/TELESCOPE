import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <div className="hero-container-premium">
            <div className="hero-content-premium">
                <div className="hero-badge">
                    <Sparkles size={16} />
                    <span>Tu farmacia digital de confianza</span>
                </div>
                <h1 className="hero-title-premium">
                    Salud y Bienestar <br />
                    <span className="text-gradient">al alcance de un clic</span>
                </h1>
                <p className="hero-description-premium">
                    Encuentra medicamentos, productos de cuidado personal y consejos de salud en un solo lugar.
                    Envíos rápidos y seguros a todo el país.
                </p>
                <div className="hero-actions">
                    <button onClick={() => document.getElementById('ofertas').scrollIntoView({ behavior: 'smooth' })} className="btn-hero-primary">
                        Ver Ofertas <ArrowRight size={20} />
                    </button>
                    <button onClick={() => navigate('/category/Cuidado%20Personal')} className="btn-hero-secondary">
                        Cuidado Personal
                    </button>
                </div>

                <div className="hero-stats">
                    <div className="stat-item">
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">Servicio</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-number">+5k</span>
                        <span className="stat-label">Productos</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-number">100%</span>
                        <span className="stat-label">Seguro</span>
                    </div>
                </div>
            </div>

            <div className="hero-visual-premium">
                <div className="floating-card card-1">
                    <div className="icon-box bg-blue">💊</div>
                    <div className="card-text">
                        <span className="card-title">Medicamentos</span>
                        <span className="card-sub">Receta y libre venta</span>
                    </div>
                </div>
                <div className="floating-card card-2">
                    <div className="icon-box bg-green">🌿</div>
                    <div className="card-text">
                        <span className="card-title">Natural</span>
                        <span className="card-sub">Vitaminas y más</span>
                    </div>
                </div>
                <div className="floating-card card-3">
                    <div className="icon-box bg-purple">✨</div>
                    <div className="card-text">
                        <span className="card-title">Belleza</span>
                        <span className="card-sub">Dermocosmética</span>
                    </div>
                </div>
                <div className="hero-circle-bg"></div>
            </div>
        </div>
    );
};

export default HeroSection;
