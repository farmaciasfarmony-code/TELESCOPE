import React from 'react';
import { Plus, Trash2, Link as LinkIcon, Facebook, Twitter, Instagram } from 'lucide-react';

const AdminFooterTab = ({ footerData, onChange }) => {
    // Local state initialized from props, but synchronized back to parent on change
    // Using local state to avoid slow typing if parent is far away, but controlled is fine too.

    // Safety check just in case footerData is undefined initially
    const safeData = footerData || {
        columns: [],
        social: { facebook: '', twitter: '', instagram: '' },
        contact: { phone: '' }
    };

    const handleColumnTitleChange = (colIndex, newTitle) => {
        const newColumns = [...safeData.columns];
        newColumns[colIndex] = { ...newColumns[colIndex], title: newTitle };
        onChange({ ...safeData, columns: newColumns });
    };

    const handleLinkChange = (colIndex, linkIndex, field, value) => {
        const newColumns = [...safeData.columns];
        const newLinks = [...newColumns[colIndex].links];
        newLinks[linkIndex] = { ...newLinks[linkIndex], [field]: value };
        newColumns[colIndex] = { ...newColumns[colIndex], links: newLinks };
        onChange({ ...safeData, columns: newColumns });
    };

    const addLink = (colIndex) => {
        const newColumns = [...safeData.columns];
        if (!newColumns[colIndex].links) newColumns[colIndex].links = [];
        newColumns[colIndex].links.push({ name: 'Nuevo Enlace', to: '/' });
        onChange({ ...safeData, columns: newColumns });
    };

    const removeLink = (colIndex, linkIndex) => {
        const newColumns = [...safeData.columns];
        newColumns[colIndex].links = newColumns[colIndex].links.filter((_, i) => i !== linkIndex);
        onChange({ ...safeData, columns: newColumns });
    };

    const addColumn = () => {
        if (safeData.columns.length >= 4) return; // Limit columns
        const newColumns = [...safeData.columns, { title: 'Nueva Columna', links: [] }];
        onChange({ ...safeData, columns: newColumns });
    };

    const removeColumn = (colIndex) => {
        if (window.confirm("¿Eliminar columna y sus enlaces?")) {
            const newColumns = safeData.columns.filter((_, i) => i !== colIndex);
            onChange({ ...safeData, columns: newColumns });
        }
    };

    const handleSocialChange = (network, value) => {
        onChange({
            ...safeData,
            social: { ...safeData.social, [network]: value }
        });
    };

    const handleContactChange = (field, value) => {
        onChange({
            ...safeData,
            contact: { ...safeData.contact, [field]: value }
        });
    };

    return (
        <div className="footer-editor">
            <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Enlaces y Columnas</h3>

            <div className="columns-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                {safeData.columns.map((col, colIndex) => (
                    <div key={colIndex} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                value={col.title}
                                onChange={(e) => handleColumnTitleChange(colIndex, e.target.value)}
                                className="form-input"
                                style={{ fontWeight: 'bold' }}
                                placeholder="Título Columna"
                            />
                            <button
                                onClick={() => removeColumn(colIndex)}
                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                title="Eliminar Columna"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {col.links?.map((link, linkIndex) => (
                                <div key={linkIndex} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        value={link.name}
                                        onChange={(e) => handleLinkChange(colIndex, linkIndex, 'name', e.target.value)}
                                        placeholder="Texto"
                                        className="form-input"
                                        style={{ flex: 1, fontSize: '0.9rem' }}
                                    />
                                    <input
                                        type="text"
                                        value={link.to}
                                        onChange={(e) => handleLinkChange(colIndex, linkIndex, 'to', e.target.value)}
                                        placeholder="/url"
                                        className="form-input"
                                        style={{ flex: 1, fontSize: '0.9rem', color: '#64748b' }}
                                    />
                                    <button
                                        onClick={() => removeLink(colIndex, linkIndex)}
                                        style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => addLink(colIndex)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem', fontWeight: '500' }}
                            >
                                <Plus size={16} /> Añadir Enlace
                            </button>
                        </div>
                    </div>
                ))}

                {safeData.columns.length < 4 && (
                    <button
                        onClick={addColumn}
                        style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', background: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}
                    >
                        <Plus size={40} />
                        <span style={{ fontWeight: '600' }}>Nueva Columna</span>
                    </button>
                )}
            </div>

            <h3 style={{ marginBottom: '1.5rem', color: '#1e293b', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>Redes Sociales y Contacto</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>Título de Sección</label>
                        <input
                            type="text"
                            value={safeData.social?.title || 'Síguenos'}
                            onChange={(e) => handleSocialChange('title', e.target.value)}
                            className="form-input"
                            style={{ fontWeight: 'bold', width: '100%', marginBottom: '1rem' }}
                        />
                    </div>

                    <h4 style={{ marginBottom: '1rem', color: '#475569' }}>Enlaces</h4>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <Facebook size={18} className="text-blue-600" />
                            <label style={{ fontSize: '0.9rem' }}>Facebook URL</label>
                        </div>
                        <input
                            type="text"
                            value={safeData.social?.facebook || ''}
                            onChange={(e) => handleSocialChange('facebook', e.target.value)}
                            className="form-input"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <Twitter size={18} className="text-blue-400" />
                            <label style={{ fontSize: '0.9rem' }}>Twitter URL</label>
                        </div>
                        <input
                            type="text"
                            value={safeData.social?.twitter || ''}
                            onChange={(e) => handleSocialChange('twitter', e.target.value)}
                            className="form-input"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="form-group">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <Instagram size={18} className="text-pink-600" />
                            <label style={{ fontSize: '0.9rem' }}>Instagram URL</label>
                        </div>
                        <input
                            type="text"
                            value={safeData.social?.instagram || ''}
                            onChange={(e) => handleSocialChange('instagram', e.target.value)}
                            className="form-input"
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>Título de Sección</label>
                        <input
                            type="text"
                            value={safeData.contact?.title || 'Teléfono'}
                            onChange={(e) => handleContactChange('title', e.target.value)}
                            className="form-input"
                            style={{ fontWeight: 'bold', width: '100%', marginBottom: '1rem' }}
                        />
                    </div>

                    <h4 style={{ marginBottom: '1rem', color: '#475569' }}>Información</h4>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Número</label>
                        <input
                            type="text"
                            value={safeData.contact?.phone || ''}
                            onChange={(e) => handleContactChange('phone', e.target.value)}
                            className="form-input"
                            style={{ width: '100%' }}
                            placeholder="(55) 0000-0000"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFooterTab;
