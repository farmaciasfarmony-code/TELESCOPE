import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ShoppingBag,
    User as UserIcon,
    Shield,
    CreditCard,
    MapPin,
    LogOut,
    Heart,
    Camera,
    ChevronRight,
    Facebook,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Mail,
    Lock
} from 'lucide-react';
import './AccountPage.css';
import { auth, db, googleProvider, facebookProvider } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import {
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

// --- HELPER COMPONENTS ---

// --- HELPER COMPONENTS ---

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const StatusMessage = ({ message, type }) => {
    if (!message) return null;
    return (
        <div className={`status-message ${type}`} style={{
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            backgroundColor: type === 'error' ? '#fef2f2' : '#f0fdf4',
            color: type === 'error' ? '#dc2626' : '#16a34a',
            border: `1px solid ${type === 'error' ? '#fee2e2' : '#dcfce7'}`
        }}>
            {message}
        </div>
    );
};

// --- SECTIONS ---

const OverviewSection = ({ user }) => (
    <div>
        <div className="content-header">
            <h2 className="content-title">Bienvenido, {user.displayName || 'Usuario'}</h2>
            <p className="content-subtitle">Desde aquí puedes gestionar tus pedidos recientes, direcciones de envío y detalles de tu cuenta.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#f9fafb' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>Información Personal</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{user.displayName}</p>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{user.email}</p>
                {user.phone && <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{user.phone}</p>}
            </div>
            {/* Add more summary cards here if needed */}
        </div>
    </div>
);

const PersonalInfoSection = ({ user }) => {
    const [displayName, setDisplayName] = useState(user.displayName || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [status, setStatus] = useState({ msg: '', type: '' });
    const [loading, setLoading] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ msg: '', type: '' });

        try {
            // 1. Update Authentication Profile (Display Name)
            if (displayName !== user.displayName) {
                await updateProfile(user, { displayName });
            }

            // 2. Update Firestore Profile (Phone & Backup Email)
            // Using setDoc with merge:true ensures we don't overwrite other fields (like photoBase64)
            const userDocRef = doc(db, 'customers', user.uid);
            await setDoc(userDocRef, {
                phone: phone,
                email: user.email, // Always good to keep email synced in DB
                lastUpdated: new Date()
            }, { merge: true });

            setStatus({ msg: 'Información actualizada correctamente', type: 'success' });
        } catch (error) {
            console.error("Error updating profile:", error);
            setStatus({ msg: 'Error al actualizar', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div>
            <div className="content-header">
                <h2 className="content-title">Información Personal</h2>
                <p className="content-subtitle">Actualiza tu nombre y datos de contacto.</p>
            </div>
            <StatusMessage message={status.msg} type={status.type} />
            <form onSubmit={handleSave} style={{ maxWidth: '500px' }}>
                <div className="form-group">
                    <label className="form-label">Nombre completo</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Teléfono Móvil <span style={{ color: 'red' }}>*</span></label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-input"
                        placeholder="Ej. 55 1234 5678"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Correo electrónico</label>
                    <input
                        type="email"
                        value={user.email}
                        disabled
                        className="form-input"
                        style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </form>
        </div>
    );
};

const SecuritySection = ({ user }) => {
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [status, setStatus] = useState({ msg: '', type: '' });
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ msg: '', type: '' });
        try {
            const cred = EmailAuthProvider.credential(user.email, currentPass);
            await reauthenticateWithCredential(user, cred);
            await updatePassword(user, newPass);
            setStatus({ msg: 'Contraseña actualizada correctamente', type: 'success' });
            setCurrentPass('');
            setNewPass('');
        } catch {
            setStatus({ msg: 'Error: Verifica tu contraseña actual', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div>
            <div className="content-header">
                <h2 className="content-title">Seguridad</h2>
                <p className="content-subtitle">Gestiona tu contraseña y la seguridad de tu cuenta.</p>
            </div>
            <StatusMessage message={status.msg} type={status.type} />
            <form onSubmit={handleChangePassword} style={{ maxWidth: '500px' }}>
                <div className="form-group">
                    <label className="form-label">Contraseña actual</label>
                    <input
                        type="password"
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Nueva contraseña</label>
                    <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="form-input"
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    Actualizar Contraseña
                </button>
            </form>
        </div>
    );
};

const AddressesSection = ({ user }) => {
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: '',
        exteriorNumber: '',
        interiorNumber: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const q = collection(db, 'customers', user.uid, 'addresses');
                const querySnapshot = await getDocs(q);
                setAddresses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching addresses:", error);
            } finally {
                setLoading(false);
            }
        };
        if (user?.uid) fetchAddresses();
    }, [user]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const docRef = await addDoc(collection(db, 'customers', user.uid, 'addresses'), {
                ...newAddress,
                default: addresses.length === 0
            });
            setAddresses([...addresses, { ...newAddress, id: docRef.id, default: addresses.length === 0 }]);
            setShowForm(false);
            setNewAddress({ street: '', exteriorNumber: '', interiorNumber: '', neighborhood: '', city: '', state: '', zipCode: '' });
        } catch {
            alert("Error al guardar la dirección.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar dirección?")) return;
        try {
            await deleteDoc(doc(db, 'customers', user.uid, 'addresses', id));
            setAddresses(addresses.filter(a => a.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="content-header">
                <h2 className="content-title">Mis Direcciones</h2>
                <p className="content-subtitle">Gestiona tus direcciones de envío y facturación.</p>
            </div>

            {loading ? <p>Cargando...</p> : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {addresses.map(addr => (
                        <div key={addr.id} style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                            <div>
                                <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '1.05rem' }}>
                                    {addr.street} #{addr.exteriorNumber} {addr.interiorNumber ? `Int ${addr.interiorNumber}` : ''}
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                                    {addr.neighborhood}
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                    {addr.city}, {addr.state} — CP {addr.zipCode}
                                </div>
                                {addr.default && <span className="status-badge status-completed" style={{ marginTop: '0.5rem', display: 'inline-block' }}>Predeterminada</span>}
                            </div>
                            <button onClick={() => handleDelete(addr.id)} style={{ color: '#ef4444', background: '#fee2e2', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px' }} title="Eliminar">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {addresses.length === 0 && !showForm && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', background: '#f9fafb', borderRadius: '12px' }}>
                            <MapPin size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p>No tienes direcciones guardadas.</p>
                        </div>
                    )}
                </div>
            )}

            {showForm ? (
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>Nueva Dirección</h3>
                    <form onSubmit={handleAdd}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Calle</label>
                                <input className="form-input" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">No. Ext</label>
                                <input className="form-input" value={newAddress.exteriorNumber} onChange={e => setNewAddress({ ...newAddress, exteriorNumber: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">No. Int</label>
                                <input className="form-input" value={newAddress.interiorNumber} onChange={e => setNewAddress({ ...newAddress, interiorNumber: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Colonia</label>
                            <input className="form-input" value={newAddress.neighborhood} onChange={e => setNewAddress({ ...newAddress, neighborhood: e.target.value })} required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Código Postal</label>
                                <input className="form-input" value={newAddress.zipCode} onChange={e => setNewAddress({ ...newAddress, zipCode: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ciudad</label>
                                <input className="form-input" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Estado</label>
                                <input className="form-input" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', background: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>Cancelar</button>
                            <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Guardar Dirección</button>
                        </div>
                    </form>
                </div>
            ) : (
                <button onClick={() => setShowForm(true)} className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}>
                    <Plus size={18} /> Agregar Nueva Dirección
                </button>
            )}
        </div>
    );
};

const OrdersSection = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const q = query(collection(db, 'orders'), where('customer.email', '==', user.email));
                const querySnapshot = await getDocs(q);
                const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                ordersData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setOrders(ordersData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (user?.email) fetchOrders();
    }, [user]);

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'status-pending',
            completed: 'status-completed',
            cancelled: 'status-cancelled'
        };
        const labels = {
            pending: 'Pendiente',
            completed: 'Completado',
            cancelled: 'Cancelado'
        };
        return <span className={`status-badge ${styles[status] || 'status-pending'}`}>{labels[status] || status}</span>;
    };

    return (
        <div>
            <div className="content-header">
                <h2 className="content-title">Mis Pedidos</h2>
                <p className="content-subtitle">Historial de tus compras recientes.</p>
            </div>
            {loading ? <p>Cargando...</p> : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    <ShoppingBag size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No has realizado pedidos aún.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {orders.map(order => (
                        <div key={order.id} className="order-item">
                            <div className="order-header-row">
                                <div>
                                    <span style={{ fontWeight: '700', color: '#1f2937' }}>#{order.id.slice(0, 8)}</span>
                                    <span style={{ margin: '0 0.5rem', color: '#d1d5db' }}>|</span>
                                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                {order.items?.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                                        <span>{item.quantity}x <Link to={`/product/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{item.name}</Link></span>
                                        <span style={{ fontWeight: '500' }}>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ borderTop: '1px dashed #e5e7eb', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', fontWeight: '700', fontSize: '1.1rem' }}>
                                Total: ${order.total?.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const WishlistSection = () => {
    const { wishlist, removeFromWishlist, loading } = useWishlist();
    const { addToCart } = useCart();

    return (
        <div>
            <div className="content-header">
                <h2 className="content-title">Lista de Deseos</h2>
                <p className="content-subtitle">Tus productos favoritos guardados.</p>
            </div>
            {loading ? <p>Cargando...</p> : wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    <Heart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Tu lista de deseos está vacía.</p>
                </div>
            ) : (
                <div className="wishlist-grid">
                    {wishlist.map(item => (
                        <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', position: 'relative' }}>
                            <button onClick={() => removeFromWishlist(item.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}>
                                <Trash2 size={14} />
                            </button>
                            <Link to={`/product/${item.id}`} style={{ display: 'block', marginBottom: '1rem' }}>
                                <div style={{ height: '150px', background: '#f9fafb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : '💊'}
                                </div>
                            </Link>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                <span style={{ fontWeight: '700' }}>${item.price.toFixed(2)}</span>
                                <button onClick={() => addToCart(item)} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer' }}>
                                    <ShoppingBag size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AuthSection = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                if (!email || !password || !name) throw new Error('Todos los campos son obligatorios');
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(cred.user, { displayName: name });
            }
        } catch (err) {
            console.error("Auth Error:", err);
            let msg = isLogin ? "Error al iniciar sesión." : "Error al registrarse.";

            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                msg = "Correo o contraseña incorrectos.";
            } else if (err.code === 'auth/email-already-in-use') {
                msg = "Este correo electrónico ya está registrado.";
            } else if (err.code === 'auth/weak-password') {
                msg = "La contraseña debe tener al menos 6 caracteres.";
            } else if (err.code === 'auth/invalid-email') {
                msg = "El formato del correo electrónico no es válido.";
            } else if (err.message) {
                msg = err.message.replace('Firebase:', '').trim();
            }
            setError(msg);
        }
        setLoading(false);
    };

    const handleSocialLogin = async (provider) => {
        try { await signInWithPopup(auth, provider); } catch { setError('Error con red social.'); }
    };

    const inputWrapperStyle = { position: 'relative', display: 'flex', alignItems: 'center' };
    const iconStyle = { position: 'absolute', left: '1rem', color: '#94a3b8' };
    const inputStyle = { paddingLeft: '2.8rem' };

    return (
        <div className="auth-container-centered">
            <div className="auth-card" style={{ maxWidth: '450px' }}>
                <h2 className="auth-title" style={{ textAlign: 'center', fontSize: '1.8rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                    {isLogin ? 'Bienvenido de nuevo' : 'Crear Cuenta'}
                </h2>
                <p className="auth-subtitle" style={{ textAlign: 'center', color: '#64748b', marginBottom: '1.5rem' }}>
                    {isLogin ? 'Ingresa a tu cuenta para continuar' : 'Regístrate para gestionar tus pedidos'}
                </p>

                {error && <StatusMessage message={error} type="error" />}

                <div className="social-login-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => handleSocialLogin(googleProvider)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#334155', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}
                    >
                        <GoogleIcon />
                        <span>Continuar con Google</span>
                    </button>
                    <button
                        onClick={() => handleSocialLogin(facebookProvider)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid #1877f2', background: '#1877f2', color: 'white', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}
                    >
                        <Facebook size={20} />
                        <span>Continuar con Facebook</span>
                    </button>
                </div>

                <div className="divider" style={{ display: 'flex', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <span style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }}></span>
                    <span style={{ padding: '0 1rem' }}>O con correo electrónico</span>
                    <span style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }}></span>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {!isLogin && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Nombre completo</label>
                            <div style={inputWrapperStyle}>
                                <UserIcon size={18} style={iconStyle} />
                                <input type="text" className="form-input" style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Juan Pérez" />
                            </div>
                        </div>
                    )}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Correo electrónico</label>
                        <div style={inputWrapperStyle}>
                            <Mail size={18} style={iconStyle} />
                            <input type="email" className="form-input" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Contraseña</label>
                        <div style={inputWrapperStyle}>
                            <Lock size={18} style={iconStyle} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                style={{ ...inputStyle, paddingRight: '2.5rem' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }} disabled={loading}>
                        {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                    </button>
                </form>

                <div className="auth-footer" style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                        className="btn-link"
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: isLogin ? '#ef4444' : '#2563eb', // Rojo si es para registrarse, Azul si es login
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

// Helper: Comprimir imagen para almacenar como string en base de datos (Persistencia asegurada)
const compressImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 300; // Tamaño ideal para avatar
                const MAX_HEIGHT = 300;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Comprimir a JPEG calidad 0.7 para asegurar string ligero
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

const AccountPage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [uploadingImg, setUploadingImg] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Cargar usuario y su foto personalizada desde Base de Datos
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (u) {
                // Sincronizar con datos extendidos en Firestore
                try {
                    const userDocRef = doc(db, 'customers', u.uid);
                    const userDoc = await getDoc(userDocRef);

                    let dbData = {};
                    if (userDoc.exists()) {
                        dbData = userDoc.data();
                    }

                    const customPhoto = dbData.photoBase64 || u.photoURL;

                    // Mezclar objeto usuario de Auth con datos de BD
                    setUser({
                        ...u,
                        ...dbData, // This now includes 'phone' if present
                        photoURL: customPhoto
                    });
                } catch (err) {
                    console.error("Error sync user profile:", err);
                    setUser(u);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño inicial (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("La imagen es demasiado pesada (Máx. 5MB)");
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploadingImg(true);

        try {
            console.log("Procesando imagen para perfil profesional...");

            // 1. Comprimir imagen en el cliente (Optimización profesional)
            const webOptimizedImage = await compressImage(file);

            // 2. Guardar en Base de Datos (Persistencia infalible)
            // Usamos Firestore en lugar de Storage para evitar bloqueos de permisos/CORS
            const userDocRef = doc(db, 'customers', user.uid);
            await setDoc(userDocRef, {
                photoBase64: webOptimizedImage,
                updatedAt: new Date(),
                email: user.email // Buen respaldo
            }, { merge: true });

            // 3. Actualizar estado local inmediatamente
            setUser(prev => ({ ...prev, photoURL: webOptimizedImage }));

            alert("Foto de perfil actualizada exitosamente.");

        } catch (error) {
            console.error("Error updating profile picture:", error);
            alert("Hubo un problema al actualizar tu foto. Intenta con otra imagen.");
        } finally {
            setUploadingImg(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>Cargando...</div>;
    if (!user) return <div className="account-page-wrapper"><AuthSection /></div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewSection user={user} />;
            case 'info': return <PersonalInfoSection user={user} />;
            case 'security': return <SecuritySection user={user} />;
            case 'addresses': return <AddressesSection user={user} />;
            case 'orders': return <OrdersSection user={user} />;
            case 'wishlist': return <WishlistSection />;
            default: return <OverviewSection user={user} />;
        }
    };

    return (
        <div className="account-page-wrapper">
            <div className="account-layout">
                {/* SIDEBAR */}
                <aside className="account-sidebar">
                    <div className="sidebar-profile">
                        <div className="sidebar-avatar" onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer' }}>
                            {user.photoURL ? <img src={user.photoURL} alt="Profile" /> : (user.displayName || user.email).charAt(0).toUpperCase()}
                            {uploadingImg && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-small" /></div>}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                        <h3 className="sidebar-name">{user.displayName || 'Usuario'}</h3>
                        <p className="sidebar-email">{user.email}</p>
                    </div>
                    <nav className="sidebar-nav">
                        <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                            <UserIcon size={18} /> Resumen
                        </button>
                        <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                            <ShoppingBag size={18} /> Mis Pedidos
                        </button>
                        <button className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveTab('wishlist')}>
                            <Heart size={18} /> Lista de Deseos
                        </button>
                        <button className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
                            <MapPin size={18} /> Direcciones
                        </button>
                        <button className={`nav-item ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                            <CreditCard size={18} /> Datos Personales
                        </button>
                        <button className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                            <Shield size={18} /> Seguridad
                        </button>
                        <button className="nav-item danger" onClick={handleLogout}>
                            <LogOut size={18} /> Cerrar Sesión
                        </button>
                    </nav>
                </aside>

                {/* CONTENT AREA */}
                <main className="account-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AccountPage;