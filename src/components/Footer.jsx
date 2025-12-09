import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './Footer.css';

/**
 * Componente de Pie de Página (Footer) dinámico.
 * Obtiene su configuración desde el ThemeContext.
 */
const Footer = () => {
    const { theme } = useTheme();

    // Default configuration in case theme hasn't loaded or lacks footer data
    const defaultColumns = [
        {
            title: 'Atención a clientes',
            links: [
                { name: 'Contacto', to: '/contact' },
                { name: 'Preguntas frecuentes', to: '/faq' },
                { name: 'Facturación Electrónica', to: '/billing' },
                { name: 'Sucursales', to: '/stores' },
            ]
        },
        {
            title: 'Nuestra Empresa',
            links: [
                { name: 'Quiénes Somos', to: '/about' },
                { name: 'Bolsa de Trabajo', to: '/jobs' },
                { name: 'Relación con Inversionistas', to: '/investors' },
                { name: 'Aviso de privacidad', to: '/privacy' },
            ]
        },
        {
            title: 'Servicios',
            links: [
                { name: 'Consultorio Médico', to: '/services/consultorio' },
                { name: 'Análisis clínicos', to: '/services/analisis' },
                { name: 'Farmacia en Línea', to: '/' },
                { name: 'Envío a domicilio', to: '/checkout' },
            ]
        }
    ];

    const columns = theme?.footer?.columns || defaultColumns;
    const social = theme?.footer?.social || {
        title: 'Síguenos',
        facebook: "https://www.facebook.com/profile.php?id=61575232563621",
        twitter: "https://www.twitter.com",
        instagram: "https://www.instagram.com"
    };
    const contact = theme?.footer?.contact || {
        title: 'Teléfono',
        phone: "(55) 5555-5555"
    };

    return (
        <footer className="footer">
            <div className="footer-content">

                {/* Renderiza las columnas dinámicas */}
                {columns.map((section, index) => (
                    <div key={index} className="footer-column">
                        <h3 className="footer-title">{section.title}</h3>
                        <ul className="footer-list">
                            {section.links?.map((link, linkIndex) => (
                                <li key={linkIndex}>
                                    {link.to.startsWith('http') ? (
                                        <a href={link.to} target="_blank" rel="noopener noreferrer" className="footer-link">
                                            {link.name}
                                        </a>
                                    ) : (
                                        <Link to={link.to} className="footer-link">
                                            {link.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Columna de SÍGUENOS y Teléfono (Cuarta Columna) */}
                <div className="footer-column">
                    <h3 className="footer-title">{social.title || 'Síguenos'}</h3>
                    <div className="social-icons">
                        {social.facebook && (
                            <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-icon facebook">
                                <Facebook size={24} />
                            </a>
                        )}
                        {social.twitter && (
                            <a href={social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="social-icon twitter">
                                <Twitter size={24} />
                            </a>
                        )}
                        {social.instagram && (
                            <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-icon instagram">
                                <Instagram size={24} />
                            </a>
                        )}
                    </div>

                    <h3 className="footer-phone-label">{contact.title || 'Teléfono'}</h3>
                    <p className="footer-phone">{contact.phone}</p>
                </div>

            </div>

            {/* Copyright y Legal */}
            <div className="footer-copyright">
                <p>&copy; {new Date().getFullYear()} Farmacias Farmony. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;