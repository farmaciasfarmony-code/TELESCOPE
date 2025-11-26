import React from 'react';
import '../App.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-column">
                    <h4>Atención a Clientes</h4>
                    <ul>
                        <li><a href="#">Contacto</a></li>
                        <li><a href="#">Preguntas Frecuentes</a></li>
                        <li><a href="#">Facturación Electrónica</a></li>
                        <li><a href="#">Sucursales</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h4>Nuestra Empresa</h4>
                    <ul>
                        <li><a href="#">Quiénes Somos</a></li>
                        <li><a href="#">Bolsa de Trabajo</a></li>
                        <li><a href="#">Relación con Inversionistas</a></li>
                        <li><a href="#">Aviso de Privacidad</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h4>Servicios</h4>
                    <ul>
                        <li><a href="#">Consultorio Médico</a></li>
                        <li><a href="#">Análisis Clínicos</a></li>
                        <li><a href="#">Farmacia en Línea</a></li>
                        <li><a href="#">Envío a Domicilio</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h4>Síguenos</h4>
                    <ul>
                        <li><a href="#">Facebook</a></li>
                        <li><a href="#">Twitter</a></li>
                        <li><a href="#">Instagram</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 Farmacias Farmony. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;
