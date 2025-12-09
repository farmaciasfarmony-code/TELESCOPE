import React from 'react';
import { Link } from 'react-router-dom';
import { Info, ArrowLeft } from 'lucide-react';

const GenericPage = ({ title, content }) => {
    return (
        <div style={{
            padding: '4rem 2rem',
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <div style={{
                background: '#eff6ff',
                padding: '1.5rem',
                borderRadius: '50%',
                marginBottom: '1.5rem',
                color: '#2563eb'
            }}>
                <Info size={48} />
            </div>

            <h1 style={{
                fontSize: '2.5rem',
                marginBottom: '1rem',
                color: '#1f2937',
                fontWeight: '700'
            }}>{title}</h1>

            <div style={{
                fontSize: '1.1rem',
                color: '#4b5563',
                lineHeight: '1.6',
                marginBottom: '2.5rem',
                maxWidth: '600px'
            }}>
                {content || <p>Esta sección está actualmente en construcción. Estamos trabajando para brindarte la mejor experiencia.</p>}
            </div>

            <Link to="/" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'background-color 0.2s'
            }}>
                <ArrowLeft size={18} />
                Volver al Inicio
            </Link>
        </div>
    );
};

export default GenericPage;
