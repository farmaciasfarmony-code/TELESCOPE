import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { saveSettings } from '../../services/settingsService';
import { useToast } from '../../context/ToastContext';
import { Save, RefreshCw, Upload, Layout, Type } from 'lucide-react';
import AdminFooterTab from './AdminFooterTab';

const AdminSettings = () => {
    const { theme, updateThemeLocally } = useTheme();
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        siteName: '',
        primaryColor: '',
        secondaryColor: '',
        logo: '',
        footer: null
    });
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const DEFAULT_FOOTER = {
        columns: [
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
        ],
        social: {
            title: 'Síguenos',
            facebook: "https://www.facebook.com/profile.php?id=61575232563621",
            twitter: "https://www.twitter.com",
            instagram: "https://www.instagram.com"
        },
        contact: {
            title: 'Teléfono',
            phone: "(55) 5555-5555"
        }
    };

    useEffect(() => {
        if (theme) {
            setFormData({
                ...theme,
                footer: theme.footer || DEFAULT_FOOTER
            });
        }
    }, [theme]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Preview colors in real-time
        if (name === 'primaryColor' || name === 'secondaryColor') {
            updateThemeLocally({ [name]: value });
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await saveSettings(formData);
            updateThemeLocally(formData);
            addToast('Configuración guardada correctamente');
        } catch (error) {
            console.error(error);
            addToast('Error al guardar configuración', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Configuración del Sitio</h1>
                    <p>Personaliza el aspecto visual y contenido global</p>
                </div>
            </header>

            <div className="settings-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
                <button
                    onClick={() => setActiveTab('general')}
                    style={{
                        padding: '1rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'general' ? '3px solid var(--primary-color)' : '3px solid transparent',
                        color: activeTab === 'general' ? 'var(--primary-color)' : '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Type size={18} /> General
                </button>
                <button
                    onClick={() => setActiveTab('footer')}
                    style={{
                        padding: '1rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'footer' ? '3px solid var(--primary-color)' : '3px solid transparent',
                        color: activeTab === 'footer' ? 'var(--primary-color)' : '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Layout size={18} /> Pie de Página
                </button>
            </div>

            <form onSubmit={handleSave} className="settings-form" style={{ maxWidth: '100%', background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>

                {activeTab === 'general' && (
                    <div className="general-settings">
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nombre de la Tienda</label>
                            <input
                                type="text"
                                name="siteName"
                                value={formData.siteName || ''}
                                onChange={handleChange}
                                className="form-input"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Color Primario</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <input
                                        type="color"
                                        name="primaryColor"
                                        value={formData.primaryColor || '#4169E1'}
                                        onChange={handleChange}
                                        style={{ width: '60px', height: '60px', border: 'none', cursor: 'pointer', background: 'none' }}
                                    />
                                    <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{formData.primaryColor}</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Color Secundario</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <input
                                        type="color"
                                        name="secondaryColor"
                                        value={formData.secondaryColor || '#87CEEB'}
                                        onChange={handleChange}
                                        style={{ width: '60px', height: '60px', border: 'none', cursor: 'pointer', background: 'none' }}
                                    />
                                    <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{formData.secondaryColor}</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Logo de la Tienda</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    border: '2px dashed #cbd5e1',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    background: '#f8fafc'
                                }}>
                                    {formData.logo ? (
                                        <img src={formData.logo} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                    ) : (
                                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Sin Logo</span>
                                    )}
                                </div>
                                <div>
                                    <label
                                        htmlFor="logo-upload"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 1.5rem',
                                            background: 'var(--primary-color)',
                                            color: 'white',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            transition: 'opacity 0.2s'
                                        }}
                                    >
                                        <Upload size={18} /> Subir Nuevo Logo
                                    </label>
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                                        Recomendado: PNG transparente, 500x500px. Máx 1MB.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'footer' && (
                    <AdminFooterTab
                        footerData={formData.footer}
                        onChange={(newFooter) => setFormData(prev => ({ ...prev, footer: newFooter }))}
                    />
                )}

                <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1rem 2rem',
                            background: saving ? '#94a3b8' : 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            width: '100%',
                            justifyContent: 'center'
                        }}
                    >
                        {saving ? <RefreshCw className="spin" size={20} /> : <Save size={20} />}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;
