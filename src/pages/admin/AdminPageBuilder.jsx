import React, { useState, useEffect } from 'react';
import { getLayout, saveLayout } from '../../services/layoutService';
import { useToast } from '../../context/ToastContext';
import { Save, RefreshCw, Eye, EyeOff, GripVertical, Plus } from 'lucide-react';

const AdminPageBuilder = () => {
    const { addToast } = useToast();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const layout = await getLayout();
        setSections(layout.sections || []);
        setLoading(false);
    };

    const handleToggleVisibility = (index) => {
        const newSections = [...sections];
        newSections[index].visible = !newSections[index].visible;
        setSections(newSections);
    };

    const handleMoveUp = (index) => {
        if (index === 0) return;
        const newSections = [...sections];
        const temp = newSections[index];
        newSections[index] = newSections[index - 1];
        newSections[index - 1] = temp;
        setSections(newSections);
    };

    const handleMoveDown = (index) => {
        if (index === sections.length - 1) return;
        const newSections = [...sections];
        const temp = newSections[index];
        newSections[index] = newSections[index + 1];
        newSections[index + 1] = temp;
        setSections(newSections);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveLayout({ sections });
            addToast('Diseño de página guardado');
        } catch (error) {
            console.error(error);
            addToast('Error al guardar diseño', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Cargando Editor...</div>;

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Editor de Página de Inicio</h1>
                    <p>Organiza y personaliza las secciones de tu página principal (Estilo Wix)</p>
                </div>
                <button
                    onClick={handleSave}
                    className="action-btn primary"
                    disabled={saving}
                >
                    {saving ? <RefreshCw className="spin" size={20} /> : <Save size={20} />}
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </header>

            <div className="sections-editor" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {sections.map((section, index) => (
                    <div
                        key={section.id}
                        style={{
                            background: 'white',
                            padding: '1rem',
                            marginBottom: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            opacity: section.visible ? 1 : 0.6
                        }}
                    >
                        <div style={{ cursor: 'move', color: '#cbd5e1' }}>
                            <GripVertical size={24} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{section.label || section.component}</h3>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Componente: {section.component}</span>
                        </div>

                        <div className="section-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}
                                title="Mover Arriba"
                            >
                                ↑
                            </button>
                            <button
                                onClick={() => handleMoveDown(index)}
                                disabled={index === sections.length - 1}
                                style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}
                                title="Mover Abajo"
                            >
                                ↓
                            </button>

                            <button
                                onClick={() => handleToggleVisibility(index)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    background: section.visible ? '#dcfce7' : '#f1f5f9',
                                    color: section.visible ? '#166534' : '#64748b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {section.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                                {section.visible ? 'Visible' : 'Oculto'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
                <p>Próximamente: Editar textos e imágenes de cada sección.</p>
            </div>
        </div>
    );
};

export default AdminPageBuilder;
