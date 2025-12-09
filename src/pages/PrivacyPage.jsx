import React from 'react';
import { Lock, Eye, FileText, Database } from 'lucide-react';
import './LegalPages.css';

const PrivacyPage = () => {
    return (
        <div className="legal-page-container">
            <div className="legal-header">
                <h1 className="legal-title">Aviso de Privacidad</h1>
                <p className="legal-subtitle">
                    Tu privacidad es fundamental para nosotros. Conoce cómo protegemos y utilizamos tus datos personales.
                </p>
            </div>

            <div className="legal-content">
                <p style={{ marginBottom: '2rem', fontStyle: 'italic', color: '#64748b' }}>
                    Última actualización: Diciembre 2025
                </p>

                <div className="legal-section">
                    <h2><Database className="contact-icon" size={24} /> 1. Datos que Recopilamos</h2>
                    <p>
                        Para brindarte nuestros servicios, recopilamos la siguiente información personal cuando te registras o realizas una compra:
                    </p>
                    <ul>
                        <li>Información de contacto: Nombre completo, dirección de correo electrónico, número de teléfono.</li>
                        <li>Información de envío: Dirección postal completa, referencias de ubicación.</li>
                        <li>Información de transacciones: Historial de compras, detalles de pedidos.</li>
                        <li>Datos técnicos: Dirección IP, tipo de navegador y dispositivo (para mejorar la seguridad y experiencia del sitio).</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2><Eye className="contact-icon" size={24} /> 2. Uso de la Información</h2>
                    <p>
                        Utilizamos tus datos exclusivamente para los siguientes fines:
                    </p>
                    <ul>
                        <li>Procesar y entregar tus pedidos de manera eficiente.</li>
                        <li>Enviarte notificaciones sobre el estado de tu compra.</li>
                        <li>Brindarte soporte técnico y atención al cliente.</li>
                        <li>Mejorar nuestros servicios y personalizar tu experiencia de usuario.</li>
                        <li>Cumplir con obligaciones legales y fiscales.</li>
                    </ul>
                </div>

                <div className="legal-section">
                    <h2><Lock className="contact-icon" size={24} /> 3. Protección de Datos</h2>
                    <p>
                        Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger tu información contra daño, pérdida, alteración, destrucción o el uso, acceso o tratamiento no autorizado. Utilizamos encriptación SSL para proteger tus datos durante la transmisión.
                    </p>
                </div>

                <div className="legal-section">
                    <h2><FileText className="contact-icon" size={24} /> 4. Tus Derechos ARCO</h2>
                    <p>
                        Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos personales (Derechos ARCO). Para ejercer estos derechos, puedes contactar a nuestro oficial de privacidad enviando un correo a privacidad@farmony.com.
                    </p>
                </div>

                <div className="legal-section">
                    <h2>5. Cambios al Aviso de Privacidad</h2>
                    <p>
                        Nos reservamos el derecho de efectuar en cualquier momento modificaciones o actualizaciones al presente aviso de privacidad. Estas modificaciones estarán disponibles al público a través de nuestra página web.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
