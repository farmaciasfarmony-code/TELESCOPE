import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import { auth, googleProvider, facebookProvider } from '../firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from 'firebase/auth';

const AccountPage = () => {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth) return;
        const unsub = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
        });
        return () => unsub();
    }, []);

    const handleSocial = async (provider) => {
        if (!auth) {
            setMessage('Firebase no está configurado. Agrega la configuración en las variables de entorno.');
            return;
        }
        try {
            await signInWithPopup(auth, provider);
            setMessage('Inicio de sesión exitoso');
            setTimeout(() => navigate('/'), 600);
        } catch (err) {
            setMessage(err.message || 'Error en inicio social');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!auth) {
            setMessage('Firebase no está configurado.');
            return;
        }
        try {
            if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
                setMessage('Inicio de sesión correcto');
                setTimeout(() => navigate('/'), 600);
            } else {
                if (!email || !password || !name) {
                    setMessage('Completa todos los campos para registrarte');
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (userCredential.user) {
                    await updateProfile(userCredential.user, { displayName: name });
                    setMessage('Registro exitoso');
                    setTimeout(() => navigate('/'), 700);
                }
            }
        } catch (err) {
            setMessage(err.message || 'Error en autenticación');
        }
    };

    const handleLogout = async () => {
        if (!auth) return;
        await signOut(auth);
        setMessage('Sesión cerrada');
    };

    return (
        <div className="account-page" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Mi Cuenta</h2>
            <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>Inicia sesión o crea una cuenta para continuar.</p>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
                <div style={{ flex: 1, minWidth: 300 }}>
                    {currentUser ? (
                        <div style={{ background: 'white', padding: '1rem', borderRadius: 8, boxShadow: 'var(--shadow-sm)' }}>
                            <h3>Bienvenido{currentUser.displayName ? `, ${currentUser.displayName}` : ''}</h3>
                            <p>{currentUser.email}</p>
                            <button onClick={handleLogout} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.6rem', borderRadius: 6, cursor: 'pointer' }}>Cerrar sesión</button>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <button onClick={() => setMode('login')} className={mode === 'login' ? 'tab active' : 'tab'}>Iniciar sesión</button>
                                <button onClick={() => setMode('register')} className={mode === 'register' ? 'tab active' : 'tab'}>Crear cuenta</button>
                            </div>

                            <div style={{ background: 'white', padding: '1rem', borderRadius: 8, boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <button onClick={() => handleSocial(googleProvider)} style={{ background: '#db4437', color: 'white', border: 'none', padding: '0.6rem', borderRadius: 6, cursor: 'pointer' }}>Continuar con Google</button>
                                    <button onClick={() => handleSocial(facebookProvider)} style={{ background: '#1877F2', color: 'white', border: 'none', padding: '0.6rem', borderRadius: 6, cursor: 'pointer' }}>Continuar con Facebook</button>

                                    <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'var(--text-secondary)' }}>o usar tu correo electrónico</div>

                                    <form onSubmit={handleSubmit}>
                                        {mode === 'register' && (
                                            <input placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.6rem', marginBottom: '0.5rem' }} />
                                        )}
                                        <input placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.6rem', marginBottom: '0.5rem' }} />
                                        <input placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.6rem', marginBottom: '0.5rem' }} />
                                        <button type="submit" style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: 6, cursor: 'pointer' }}>{mode === 'login' ? 'Entrar' : 'Registrarse'}</button>
                                    </form>

                                    {message && <div style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>{message}</div>}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <aside style={{ width: 320, background: 'white', padding: '1rem', borderRadius: 8, boxShadow: 'var(--shadow-sm)' }}>
                    <h4>Beneficios de tener una cuenta</h4>
                    <ul>
                        <li>Historial de pedidos</li>
                        <li>Guardar direcciones</li>
                        <li>Acceso rápido a ofertas personalizadas</li>
                    </ul>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Al registrarte aceptas nuestros <Link to="#">Términos y Condiciones</Link>.</p>
                </aside>
            </div>
        </div>
    );
};

export default AccountPage;
