import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './LegalPages.css';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí iría la lógica real de envío (ej. EmailJS o backend)
        alert('Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos pronto.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="legal-page-container" style={{ maxWidth: '1000px' }}>
            <div className="legal-header">
                <h1 className="legal-title">Contáctanos</h1>
                <p className="legal-subtitle">
                    ¿Tienes alguna duda o sugerencia? Estamos aquí para escucharte.
                </p>
            </div>

            <div className="contact-grid">
                <div className="contact-info">
                    <div className="contact-card" style={{ marginBottom: '2rem' }}>
                        <Phone className="contact-icon" size={32} />
                        <h3>Llámanos</h3>
                        <p>Atención al cliente: (55) 1234-5678</p>
                        <p>Ventas: (55) 8765-4321</p>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>Lunes a Viernes de 9:00 am a 8:00 pm</p>
                    </div>

                    <div className="contact-card" style={{ marginBottom: '2rem' }}>
                        <Mail className="contact-icon" size={32} />
                        <h3>Escríbenos</h3>
                        <p>Soporte: soporte@farmony.com</p>
                        <p>Ventas: ventas@farmony.com</p>
                    </div>

                    <div className="contact-card">
                        <MapPin className="contact-icon" size={32} />
                        <h3>Visítanos</h3>
                        <p>Av. Reforma 222, Colonia Juárez</p>
                        <p>Ciudad de México, CDMX</p>
                    </div>
                </div>

                <div className="contact-form-container">
                    <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Envíanos un mensaje</h2>
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nombre Completo</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Tu nombre"
                            />
                        </div>
                        <div className="form-group">
                            <label>Correo Electrónico</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="tucorreo@ejemplo.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>Asunto</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                placeholder="¿En qué podemos ayudarte?"
                            />
                        </div>
                        <div className="form-group">
                            <label>Mensaje</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="5"
                                placeholder="Escribe tu mensaje aquí..."
                            ></textarea>
                        </div>
                        <button type="submit" className="btn-submit">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Send size={18} /> Enviar Mensaje
                            </div>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
