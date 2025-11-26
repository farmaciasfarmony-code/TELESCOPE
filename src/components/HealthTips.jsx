import React from 'react';
import { Sun, Droplets, Apple, Moon } from 'lucide-react';
import '../App.css';

const HealthTips = () => {
    return (
        <section className="health-tips-section">
            <h2 className="section-title">Consejos de Salud y Bienestar</h2>
            <div className="tips-grid">
                <div className="tip-card">
                    <Droplets size={40} className="tip-icon" />
                    <h3>Hidratación</h3>
                    <p>Bebe al menos 2 litros de agua al día para mantener tu cuerpo funcionando correctamente.</p>
                </div>
                <div className="tip-card">
                    <Sun size={40} className="tip-icon" />
                    <h3>Protección Solar</h3>
                    <p>Usa protector solar diariamente, incluso en días nublados, para cuidar tu piel.</p>
                </div>
                <div className="tip-card">
                    <Apple size={40} className="tip-icon" />
                    <h3>Alimentación Balanceada</h3>
                    <p>Incluye frutas y verduras en todas tus comidas para obtener las vitaminas necesarias.</p>
                </div>
                <div className="tip-card">
                    <Moon size={40} className="tip-icon" />
                    <h3>Descanso Adecuado</h3>
                    <p>Dormir entre 7 y 8 horas diarias es fundamental para la recuperación física y mental.</p>
                </div>
            </div>
        </section>
    );
};

export default HealthTips;
