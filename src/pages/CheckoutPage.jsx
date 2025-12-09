import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, MapPin, Phone, User, CheckCircle, ArrowLeft } from 'lucide-react';
import { addDoc, collection, doc, increment, getDoc, runTransaction, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { sendOrderConfirmationEmail } from '../services/emailService';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [addressOption, setAddressOption] = useState('new');
    const [loadingZip, setLoadingZip] = useState(false);
    const [colonies, setColonies] = useState([]);

    console.log("CheckoutPage rendering with items:", cartItems);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        // Address Breakdown
        street: '',
        exteriorNumber: '',
        interiorNumber: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        notes: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                // Initialize basic info
                setFormData(prev => ({
                    ...prev,
                    fullName: user.displayName || '',
                    email: user.email || ''
                }));

                try {
                    // 1. Fetch User Profile (Phone)
                    const userDocRef = doc(db, 'customers', user.uid);
                    const userDoc = await getDoc(userDocRef);
                    let userPhone = '';
                    if (userDoc.exists()) {
                        userPhone = userDoc.data().phone || '';
                    }

                    setFormData(prev => ({
                        ...prev,
                        phone: userPhone, // Pre-fill phone
                        fullName: user.displayName || '',
                        email: user.email || ''
                    }));

                    // 2. Fetch saved addresses from subcollection
                    const addressesRef = collection(db, 'customers', user.uid, 'addresses');
                    const snapshot = await getDocs(addressesRef);
                    if (!snapshot.empty) {
                        const loadedAddresses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        setSavedAddresses(loadedAddresses);

                        // Select default or first one
                        const defaultAddr = loadedAddresses.find(a => a.default) || loadedAddresses[0];
                        setAddressOption(defaultAddr.id);
                        fillFormWithSaved(defaultAddr);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };

        fetchUserData();
    }, [user]);

    const fillFormWithSaved = (addr) => {
        setFormData(prev => ({
            ...prev,
            street: addr.street || '',
            exteriorNumber: addr.exteriorNumber || '',
            interiorNumber: addr.interiorNumber || '',
            neighborhood: addr.neighborhood || '',
            city: addr.city || '',
            state: addr.state || '',
            zipCode: addr.zipCode || ''
        }));
    };

    const handleOptionChange = (option) => {
        setAddressOption(option);
        if (option === 'new') {
            // Clear address fields
            setFormData(prev => ({
                ...prev,
                street: '',
                exteriorNumber: '',
                interiorNumber: '',
                neighborhood: '',
                city: '',
                state: '',
                zipCode: ''
            }));
        } else {
            const selected = savedAddresses.find(a => a.id === option);
            if (selected) fillFormWithSaved(selected);
        }
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;

        // ----------------------------------------------------
        // LOGIC: Auto-fetch Address by Zip Code (Mexico)
        // ----------------------------------------------------
        if (name === 'zipCode' && addressOption === 'new') {
            setFormData(prev => ({ ...prev, zipCode: value }));

            // Only trigger if exactly 5 digits
            if (value.length === 5 && /^\d+$/.test(value)) {
                setLoadingZip(true);
                setColonies([]);
                try {
                    // Use Copomex API (Test Token)
                    // Usar Zippopotam (Gratis y sin token) para evitar datos basura de prueba
                    const response = await fetch(`https://api.zippopotam.us/mx/${value}`);

                    if (response.ok) {
                        const data = await response.json();

                        if (data.places && data.places.length > 0) {
                            const state = data.places[0].state;
                            // Extract colonies from 'place name'
                            const colonyList = data.places.map(p => p['place name']);

                            setColonies(colonyList);
                            setFormData(prev => ({
                                ...prev,
                                zipCode: value,
                                state: state || '',
                                // Zippopotam doesn't consistently return Municipality for MX.
                                // We keep 'city' editable or empty to avoid wrong data.
                                city: '',
                                neighborhood: colonyList.length === 1 ? colonyList[0] : ''
                            }));
                        }
                    } else {
                        throw new Error("Zip status not OK");
                    }
                } catch (err) {
                    console.error("Error fetching Zip Data:", err);
                } finally {
                    setLoadingZip(false);
                }
            } else if (value.length < 5) {
                // Reset if user clears input
                setColonies([]);
            }
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) {
                alert("Debes iniciar sesión para realizar un pedido.");
                setLoading(false);
                return;
            }

            // 1. Validar Stock y Actualizar
            await runTransaction(db, async (transaction) => {
                const productReads = [];
                for (const item of cartItems) {
                    const productRef = doc(db, 'products', item.id);
                    const snap = await transaction.get(productRef);
                    productReads.push({ snap, item, ref: productRef });
                }

                for (const { snap, item } of productReads) {
                    if (!snap.exists()) {
                        throw new Error(`El producto "${item.name}" ya no existe.`);
                    }
                    const currentStock = snap.data().stock || 0;
                    if (currentStock < item.quantity) {
                        throw new Error(`Stock insuficiente para "${item.name}". Disponibles: ${currentStock}`);
                    }
                }

                for (const { item, ref } of productReads) {
                    transaction.update(ref, {
                        stock: increment(-item.quantity)
                    });
                }
            });

            // Construct Full Address String for compatibility
            const fullAddressString = `${formData.street} #${formData.exteriorNumber}${formData.interiorNumber ? ` Int ${formData.interiorNumber}` : ''}, ${formData.neighborhood}, ${formData.city}, ${formData.state}, CP ${formData.zipCode}`;

            // Save new address if selected
            if (addressOption === 'new' && user) {
                try {
                    await addDoc(collection(db, 'customers', user.uid, 'addresses'), {
                        street: formData.street,
                        exteriorNumber: formData.exteriorNumber,
                        interiorNumber: formData.interiorNumber,
                        neighborhood: formData.neighborhood,
                        city: formData.city,
                        state: formData.state,
                        zipCode: formData.zipCode,
                        default: savedAddresses.length === 0 // Make default if it's the first one
                    });
                } catch (err) {
                    console.error("Error saving new address:", err);
                }
            }

            // 2. Crear Orden
            const orderData = {
                customer: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    uid: user.uid,
                    // Store detailed object AND string for compatibility
                    address: fullAddressString, // For emailService legacy check
                    addressDetails: {
                        street: formData.street,
                        exteriorNumber: formData.exteriorNumber,
                        interiorNumber: formData.interiorNumber,
                        neighborhood: formData.neighborhood,
                        city: formData.city,
                        state: formData.state,
                        zipCode: formData.zipCode
                    },
                    city: formData.city,
                    zipCode: formData.zipCode
                },
                items: cartItems,
                total: cartTotal,
                status: 'pending',
                createdAt: new Date(),
                paymentMethod: 'cash_on_delivery',
                notes: formData.notes
            };

            const docRef = await addDoc(collection(db, 'orders'), orderData);
            console.log("Orden creada con ID:", docRef.id);

            // 3. Enviar Email
            try {
                const emailSent = await sendOrderConfirmationEmail({ id: docRef.id, ...orderData });
                if (emailSent) console.log("Email enviado correctamente");
            } catch (emailErr) {
                console.error("Error crítico enviando email:", emailErr);
            }

            // 4. Limpiar y Redirigir
            clearCart();
            navigate(`/order-confirmation/${docRef.id}`);

        } catch (error) {
            console.error("Error processing order:", error);
            alert(error.message || "Hubo un error al procesar tu pedido.");
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="checkout-container" style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Tu carrito está vacío</h2>
                <button onClick={() => navigate('/')} className="btn-confirm-order" style={{ maxWidth: '200px', margin: '2rem auto' }}>
                    Volver a la tienda
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-form-section">
                <div className="checkout-title">
                    <User size={24} />
                    Datos de Envío
                </div>

                {/* Address Selector */}
                {savedAddresses.length > 0 && (
                    <div className="address-options" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Selecciona una dirección guardada:</p>
                        {savedAddresses.map(addr => (
                            <label key={addr.id} className={`address-card ${addressOption === addr.id ? 'selected' : ''}`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                    padding: '1rem', borderRadius: '8px',
                                    border: addressOption === addr.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                    background: addressOption === addr.id ? '#eff6ff' : 'white',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}>
                                <input
                                    type="radio"
                                    name="addressOption"
                                    value={addr.id}
                                    checked={addressOption === addr.id}
                                    onChange={() => handleOptionChange(addr.id)}
                                    style={{ accentColor: '#2563eb' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontWeight: '600', display: 'block', fontSize: '0.95rem' }}>
                                        {addr.street} #{addr.exteriorNumber}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        {addr.neighborhood}, {addr.city}
                                    </span>
                                </div>
                            </label>
                        ))}

                        <label className={`address-card ${addressOption === 'new' ? 'selected' : ''}`}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '1rem', borderRadius: '8px',
                                border: addressOption === 'new' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                background: addressOption === 'new' ? '#eff6ff' : 'white',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                            <input
                                type="radio"
                                name="addressOption"
                                value="new"
                                checked={addressOption === 'new'}
                                onChange={() => handleOptionChange('new')}
                                style={{ accentColor: '#2563eb' }}
                            />
                            <span style={{ fontWeight: '600' }}>+ Usar una nueva dirección</span>
                        </label>
                    </div>
                )}

                <form id="checkout-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        {/* Contact info - Always editable */}
                        <div className="form-group full-width">
                            <label className="form-label">Nombre Completo</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="form-input" placeholder="Juan Pérez" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input" placeholder="juan@ejemplo.com" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Teléfono</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="form-input" placeholder="55 1234 5678" />
                        </div>

                        {/* Address Fields - Pro Layout */}
                        <div className="form-group full-width" style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                            <label className="form-label" style={{ fontWeight: '700', color: '#1e293b' }}>
                                {addressOption === 'new' ? 'Nueva Dirección de Entrega' : 'Dirección de Entrega Seleccionada'}
                            </label>
                        </div>

                        <div className="form-group full-width" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="form-label">
                                    Calle <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Av. Principal"
                                    disabled={addressOption !== 'new'}
                                    style={{ backgroundColor: addressOption !== 'new' ? '#f1f5f9' : 'white', cursor: addressOption !== 'new' ? 'not-allowed' : 'text' }}
                                />
                            </div>
                            <div>
                                <label className="form-label">
                                    No. Ext <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    name="exteriorNumber"
                                    value={formData.exteriorNumber}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="123"
                                    disabled={addressOption !== 'new'}
                                    style={{ backgroundColor: addressOption !== 'new' ? '#f1f5f9' : 'white', cursor: addressOption !== 'new' ? 'not-allowed' : 'text' }}
                                />
                            </div>
                            <div>
                                <label className="form-label">No. Int (Op)</label>
                                <input
                                    type="text"
                                    name="interiorNumber"
                                    value={formData.interiorNumber}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="10-B"
                                    disabled={addressOption !== 'new'}
                                    style={{ backgroundColor: addressOption !== 'new' ? '#f1f5f9' : 'white', cursor: addressOption !== 'new' ? 'not-allowed' : 'text' }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Código Postal <span style={{ color: '#ef4444' }}>*</span> {loadingZip && <span style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: 'normal' }}>(Buscando...)</span>}
                            </label>
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="00000"
                                maxLength={5}
                                disabled={addressOption !== 'new'}
                                style={{ backgroundColor: addressOption !== 'new' ? '#f1f5f9' : 'white', cursor: addressOption !== 'new' ? 'not-allowed' : 'text' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Colonia <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            {colonies.length > 0 && addressOption === 'new' ? (
                                <select
                                    name="neighborhood"
                                    value={formData.neighborhood}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    style={{ backgroundColor: 'white' }}
                                >
                                    <option value="">- Selecciona tu colonia -</option>
                                    {colonies.map((col, idx) => (
                                        <option key={idx} value={col}>{col}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name="neighborhood"
                                    value={formData.neighborhood}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Colonia"
                                    disabled={addressOption !== 'new'}
                                    style={{ backgroundColor: addressOption !== 'new' ? '#f1f5f9' : 'white', cursor: addressOption !== 'new' ? 'not-allowed' : 'text' }}
                                />
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Ciudad / Municipio <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Ciudad de México"
                                disabled={addressOption !== 'new'}
                                style={{ backgroundColor: (addressOption !== 'new') ? '#f3f4f6' : 'white', cursor: (addressOption !== 'new') ? 'not-allowed' : 'text' }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                Estado <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="CDMX"
                                disabled={addressOption !== 'new'}
                                style={{ backgroundColor: (addressOption !== 'new') ? '#f3f4f6' : 'white', cursor: (addressOption !== 'new') ? 'not-allowed' : 'text' }}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">Referencias / Notas</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} className="form-input" rows="2" placeholder="Casa blanca con rejas, dejar en recepción..."></textarea>
                        </div>
                    </div>
                </form>
            </div>

            <div className="checkout-summary-section">
                <div className="checkout-title">
                    <CheckCircle size={24} />
                    Resumen del Pedido
                </div>
                <div className="summary-items">
                    {cartItems.map((item, index) => {
                        const price = Number(item.price) || 0;
                        const qty = Number(item.quantity) || 1;
                        const total = price * qty;
                        return (
                            <div key={index} className="summary-item">
                                <Link to={`/product/${item.id}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}>
                                    {item.image && (
                                        <div style={{ width: '40px', height: '40px', marginRight: '10px', flexShrink: 0 }}>
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                        </div>
                                    )}
                                    <div className="summary-item-info">
                                        <h4>{item.name}</h4>
                                        <span>Cant: {qty} &nbsp;|&nbsp; Unit: ${price.toFixed(2)}</span>
                                    </div>
                                </Link>
                                <div className="summary-item-price">
                                    ${total.toFixed(2)}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="summary-total">
                    <span className="total-label">Total a Pagar:</span>
                    <span className="total-amount">${(Number(cartTotal) || 0).toFixed(2)}</span>
                </div>

                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem', color: '#64748b' }}>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CreditCard size={16} />
                        Pago contra entrega (Efectivo o Tarjeta)
                    </p>
                </div>

                <button
                    type="submit"
                    form="checkout-form"
                    className="btn-confirm-order"
                    disabled={loading}
                >
                    {loading ? 'Procesando...' : 'Confirmar Pedido'}
                </button>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        width: '100%',
                        marginTop: '1rem',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <ArrowLeft size={16} /> Seguir Comprando
                </button>
            </div>
        </div>
    );
};

export default CheckoutPage;
