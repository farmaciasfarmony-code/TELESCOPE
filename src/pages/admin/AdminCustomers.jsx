import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Search } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const customersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Handle dates that might be timestamps or strings
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
            }));
            setCustomers(customersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredCustomers = customers.filter(customer =>
        customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="admin-header">
                <h1 className="admin-title">Base de Datos de Clientes</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '0.6rem 0.6rem 0.6rem 2.2rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                outline: 'none',
                                minWidth: '250px'
                            }}
                        />
                    </div>
                    <button className="btn-admin-secondary">Exportar CSV</button>
                </div>
            </div>

            <div className="data-table-container">
                {loading ? (
                    <div className="p-8 text-center">Cargando clientes...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID Cliente</th>
                                <th>Nombre</th>
                                <th>Contacto</th>
                                <th>Total Gastado</th>
                                <th>Pedidos</th>
                                <th>Fecha Registro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-4">No se encontraron clientes.</td>
                                </tr>
                            ) : (
                                filteredCustomers.map(customer => (
                                    <tr key={customer.id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{customer.id.slice(0, 8)}...</td>
                                        <td style={{ fontWeight: '600' }}>{customer.fullName || 'Sin Nombre'}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Mail size={14} color="#6b7280" />
                                                {customer.email}
                                            </div>
                                        </td>
                                        <td>${(customer.totalSpent || 0).toLocaleString()}</td>
                                        <td>{customer.orderCount || 0}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={14} color="#6b7280" />
                                                {customer.createdAt ? customer.createdAt.toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminCustomers;
