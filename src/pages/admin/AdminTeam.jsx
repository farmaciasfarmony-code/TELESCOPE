import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Mail, Clock } from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminTeam = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const { adminUser } = useAdminAuth();

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'admins'));
            const adminsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAdmins(adminsData);
        } catch (error) {
            console.error("Error fetching admins:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (adminId, email) => {
        if (!window.confirm(`¿Aprobar acceso para ${email}?`)) return;

        try {
            await updateDoc(doc(db, 'admins', adminId), {
                status: 'active'
            });

            // Simulate sending welcome email
            console.log(`[SIMULATION] Sending WELCOME email to ${email}`);
            alert(`Usuario ${email} aprobado correctamente.`);

            fetchAdmins(); // Refresh list
        } catch (error) {
            console.error("Error approving admin:", error);
            alert("Error al aprobar usuario.");
        }
    };

    const handleDeny = async (adminId) => {
        if (!window.confirm("¿Denegar y bloquear acceso?")) return;

        try {
            await updateDoc(doc(db, 'admins', adminId), {
                status: 'denied'
            });
            fetchAdmins();
        } catch (error) {
            console.error("Error denying admin:", error);
        }
    };

    if (loading) return <div>Cargando equipo...</div>;

    return (
        <div>
            <div className="admin-header">
                <h1 className="admin-title">Gestión de Equipo</h1>
                <p style={{ color: '#6b7280' }}>Administra los accesos al panel de control.</p>
            </div>

            <div className="data-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Fecha Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map(admin => (
                            <tr key={admin.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: '#eff6ff', color: '#3b82f6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Shield size={16} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{admin.email}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>ID: {admin.id.slice(0, 8)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        textTransform: 'capitalize',
                                        background: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem'
                                    }}>
                                        {admin.role || 'Admin'}
                                    </span>
                                </td>
                                <td>
                                    {admin.status === 'active' && (
                                        <span style={{ color: '#10b981', background: '#d1fae5', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <Check size={12} /> Activo
                                        </span>
                                    )}
                                    {admin.status === 'pending' && (
                                        <span style={{ color: '#f59e0b', background: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} /> Pendiente
                                        </span>
                                    )}
                                    {admin.status === 'denied' && (
                                        <span style={{ color: '#ef4444', background: '#fee2e2', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <X size={12} /> Denegado
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {admin.createdAt?.seconds
                                        ? new Date(admin.createdAt.seconds * 1000).toLocaleDateString()
                                        : 'N/A'}
                                </td>
                                <td>
                                    {admin.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleApprove(admin.id, admin.email)}
                                                className="btn-admin-primary"
                                                style={{ background: '#10b981', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                                title="Aprobar acceso"
                                            >
                                                Aprobar
                                            </button>
                                            <button
                                                onClick={() => handleDeny(admin.id)}
                                                className="btn-admin-primary"
                                                style={{ background: '#ef4444', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                                title="Denegar acceso"
                                            >
                                                Denegar
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminTeam;
