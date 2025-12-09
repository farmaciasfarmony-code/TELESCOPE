import React from 'react';
import { Heart, ShieldCheck, Truck, Users } from 'lucide-react';
import './LegalPages.css';

const AboutPage = () => {
    return (
        <div className="legal-page-container">
            <div className="legal-header">
                <h1 className="legal-title">Sobre Farmony</h1>
                <p className="legal-subtitle">
                    Tu aliado en salud y bienestar, combinando la confianza de la farmacia tradicional con la innovación digital.
                </p>
            </div>

            <div className="legal-content">
                <div className="legal-section">
                    <h2><Heart className="contact-icon" size={28} /> Nuestra Misión</h2>
                    <p>
                        En Farmony, nuestra misión es democratizar el acceso a la salud y el bienestar. Creemos que cuidar de ti y de tu familia no debería ser complicado ni costoso. Por eso, trabajamos día a día para ofrecerte un catálogo amplio de medicamentos y productos de cuidado personal, con precios justos y una experiencia de compra inigualable.
                    </p>
                </div>

                <div className="legal-section">
                    <h2><ShieldCheck className="contact-icon" size={28} /> Compromiso de Calidad</h2>
                    <p>
                        La seguridad es nuestra prioridad número uno. Todos nuestros productos provienen de laboratorios certificados y proveedores autorizados. Mantenemos estrictos controles de calidad en el almacenamiento y manejo de medicamentos para garantizar que recibas exactamente lo que necesitas, en perfectas condiciones.
                    </p>
                </div>

                <div className="legal-section">
                    <h2><Users className="contact-icon" size={28} /> Nuestro Equipo</h2>
                    <p>
                        Detrás de Farmony hay un equipo apasionado de farmacéuticos, expertos en tecnología y profesionales de atención al cliente. No somos solo una tienda en línea; somos personas reales comprometidas con tu salud. Nuestro equipo de soporte está disponible para resolver tus dudas y guiarte en tu compra.
                    </p>
                </div>

                <div className="legal-section">
                    <h2><Truck className="contact-icon" size={28} /> Innovación y Servicio</h2>
                    <p>
                        Nacimos en la era digital para adaptarnos a tu estilo de vida. Con nuestra plataforma intuitiva, envíos rápidos y seguimiento en tiempo real, transformamos la visita a la farmacia en algo simple y cómodo. Ya sea que necesites un medicamento urgente o tus vitaminas mensuales, Farmony llega hasta tu puerta.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
