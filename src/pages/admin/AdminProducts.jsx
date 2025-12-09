import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, Database, Upload, CheckCircle, XCircle, FileSpreadsheet, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct, addProduct, batchAddProducts, toggleProductStatus, subscribeToProducts } from '../../services/productService';
import { products as initialMockData } from '../../data/products';
import * as XLSX from 'xlsx';
import './AdminProducts.css';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'pending'
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        // Subscribe to real-time updates
        const unsubscribe = subscribeToProducts(
            (data) => {
                console.log("AdminProducts: Real-time update received", data.length, "products");
                setProducts(data);
                setLoading(false);
            },
            (err) => {
                console.error("AdminProducts subscription error:", err);
                // Mostrar el mensaje real para depurar
                setError(`Error: ${err.message || 'Error desconocido'}. (Código: ${err.code || 'N/A'})`);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const handleSeedData = async () => {
        if (!window.confirm("¿Seguro que quieres poblar la base de datos con los datos de prueba? Esto creará duplicados si ya existen.")) return;

        setLoading(true);
        console.log("Iniciando carga masiva de datos...");
        try {
            const productsToLoad = initialMockData.map(({ id, ...rest }) => ({
                ...rest,
                status: 'active' // Seed data is active by default
            }));

            const count = await batchAddProducts(productsToLoad);

            console.log(`Carga masiva completada. ${count} productos agregados.`);
            alert(`¡Éxito! Se han cargado ${count} productos correctamente.`);
            // await fetchProducts(); // Handled by subscription
        } catch (error) {
            console.error("Error seeding data:", error);
            alert("Error al cargar datos. Revisa la consola.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                setLoading(true);
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    alert("El archivo Excel parece estar vacío.");
                    setLoading(false);
                    return;
                }

                // Basic validation/mapping
                const productsToImport = data.map(row => ({
                    name: row.Nombre || row.name || 'Sin Nombre',
                    category: row.Categoria || row.category || 'General',
                    price: row.Precio || row.price || 0,
                    stock: row.Stock || row.stock || 0,
                    description: row.Descripcion || row.description || '',
                    status: 'active'
                }));

                // Generate a preview string
                const preview = productsToImport.slice(0, 3).map(p =>
                    `- ${p.name} ($${p.price}) [${p.category}]`
                ).join('\n');

                const confirmMessage = `Se encontraron ${productsToImport.length} productos.\n\nPrimeros 3 ejemplos:\n${preview}\n\n¿Deseas importarlos? Se publicarán inmediatamente.`;

                if (window.confirm(confirmMessage)) {
                    const count = await batchAddProducts(productsToImport);
                    alert(`¡Éxito! Se agregaron ${count} productos correctamente.`);
                }

            } catch (error) {
                console.error("Error parsing Excel:", error);
                alert("Error al procesar el archivo Excel. Asegúrate de que tenga el formato correcto.");
            } finally {
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleToggleStatus = async (product) => {
        try {
            const newStatus = await toggleProductStatus(product.id, product.status || 'active');
            setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
        } catch (error) {
            alert("Error al cambiar estado del producto");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await deleteProduct(id);
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                alert("Error al eliminar producto");
            }
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.barcode && p.barcode.includes(searchTerm)) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && (p.status === 'active' || !p.status)) ||
            (filterStatus === 'pending' && p.status === 'pending');
        return matchesSearch && matchesStatus;
    });

    // Skeleton Loader Component
    const TableSkeleton = () => (
        <div className="data-table-container">
            <div className="table-header">
                <div className="skeleton-bar medium"></div>
            </div>
            <table className="admin-table-skeleton">
                <tbody>
                    {[...Array(5)].map((_, i) => (
                        <tr key={i} className="skeleton-row">
                            <td><div className="skeleton-bar long"></div></td>
                            <td><div className="skeleton-bar medium"></div></td>
                            <td><div className="skeleton-bar short"></div></td>
                            <td><div className="skeleton-bar short"></div></td>
                            <td><div className="skeleton-bar medium"></div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center">
            <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
            <button onClick={() => window.location.reload()} className="btn-admin-primary">Reintentar</button>
        </div>
    );

    return (
        <div>
            <div className="admin-header">
                <h1 className="admin-title">Gestión de Productos</h1>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                    />
                    <button className="btn-admin-secondary" onClick={() => fileInputRef.current.click()} title="Importar Excel">
                        <FileSpreadsheet size={20} /> Importar Excel
                    </button>

                    {products.length === 0 && !loading && (
                        <button className="btn-admin-secondary" onClick={handleSeedData} title="Cargar datos de prueba">
                            <Database size={20} /> Poblar BD
                        </button>
                    )}
                    {products.length > 0 && (
                        <button
                            className="btn-admin-secondary"
                            onClick={async () => {
                                if (window.confirm("¡PELIGRO! ¿Estás seguro de borrar TODOS los productos? Esto no se puede deshacer.")) {
                                    setLoading(true);
                                    try {
                                        const { deleteAllProducts } = await import('../../services/productService');
                                        const count = await deleteAllProducts();
                                        alert(`Se eliminaron ${count} productos.`);
                                        setProducts([]);
                                    } catch (e) {
                                        alert("Error al eliminar.");
                                    } finally {
                                        setLoading(false);
                                    }
                                }
                            }}
                            title="Borrar Todo (Reset)"
                            style={{ backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fecaca' }}
                        >
                            <Trash2 size={20} /> Resetear BD
                        </button>
                    )}
                    <button className="btn-admin-primary" onClick={() => navigate('/admin/products/new')}>
                        <Plus size={20} /> Nuevo Producto
                    </button>
                </div>
            </div>

            {loading ? (
                <TableSkeleton />
            ) : (
                <div className="data-table-container">
                    <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem 0.6rem 0.6rem 2.2rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div className="filter-tabs" style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setFilterStatus('all')}
                                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: filterStatus === 'all' ? '#e2e8f0' : 'transparent', cursor: 'pointer', fontWeight: filterStatus === 'all' ? 'bold' : 'normal' }}
                            >
                                Todos ({products.length})
                            </button>
                            <button
                                onClick={() => setFilterStatus('active')}
                                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: filterStatus === 'active' ? '#dcfce7' : 'transparent', color: filterStatus === 'active' ? '#166534' : 'inherit', cursor: 'pointer', fontWeight: filterStatus === 'active' ? 'bold' : 'normal' }}
                            >
                                Activos
                            </button>
                            <button
                                onClick={() => setFilterStatus('pending')}
                                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: filterStatus === 'pending' ? '#fef9c3' : 'transparent', color: filterStatus === 'pending' ? '#854d0e' : 'inherit', cursor: 'pointer', fontWeight: filterStatus === 'pending' ? 'bold' : 'normal' }}
                            >
                                Pendientes
                            </button>
                        </div>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Código</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Estado</th>
                                <th>Visibilidad</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id} style={{ opacity: product.status === 'pending' ? 0.7 : 1 }}>
                                    <td style={{ fontWeight: '600' }}>{product.name}</td>
                                    <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{product.barcode || '-'}</td>
                                    <td>{product.category}</td>
                                    <td>${product.price.toFixed(2)}</td>
                                    <td>{product.stock || 0}</td>
                                    <td>
                                        <span className={`status-badge ${product.stock > 10 ? 'status-success' : product.stock > 0 ? 'status-warning' : 'status-danger'}`}>
                                            {product.stock > 10 ? 'En Stock' : product.stock > 0 ? 'Bajo Stock' : 'Agotado'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleStatus(product)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                background: product.status === 'pending' ? '#fef9c3' : '#dcfce7',
                                                color: product.status === 'pending' ? '#854d0e' : '#166534',
                                                fontSize: '0.85rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {product.status === 'pending' ? <EyeOff size={14} /> : <Eye size={14} />}
                                            {product.status === 'pending' ? 'Oculto' : 'Visible'}
                                        </button>
                                    </td>
                                    <td>
                                        <button className="action-btn" title="Editar" onClick={() => navigate(`/admin/products/edit/${product.id}`)}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="action-btn" title="Eliminar" onClick={() => handleDelete(product.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center p-4 text-gray-500">
                                        No se encontraron productos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
