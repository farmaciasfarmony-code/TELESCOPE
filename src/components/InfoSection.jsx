import React from 'react';
import { ShieldCheck, Heart, Truck } from 'lucide-react';
import '../App.css';

const InfoSection = () => {
    return (
        <section className="info-section">
            <div className="info-container">
                <div className="info-card">
                    <ShieldCheck size={48} className="info-icon" />
                    <h3>Confianza y Calidad</h3>
                    <p>Productos certificados y de la más alta calidad para tu salud.</p>
                </div>
                <div className="info-card">
                    <Heart size={48} className="info-icon" />
                    <h3>Cuidamos de Ti</h3>
                    <p>Atención personalizada y farmacéuticos expertos a tu disposición.</p>
                </div>
                <div className="info-card">
                    <Truck size={48} className="info-icon" />
                    <h3>Envíos Rápidos</h3>
                    <p>Recibe tus medicamentos en la puerta de tu casa en tiempo récord.</p>
                </div>
            </div>
        </section>
    );
};

export default InfoSection;
