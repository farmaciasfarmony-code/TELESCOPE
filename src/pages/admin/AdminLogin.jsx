import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Lock, User, ArrowRight } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const { login, register, resetPassword, logout } = useAdminAuth();
    const navigate = useNavigate();

    // Force basic logout on mount to prevent auto-login overlap perception
    // or simply just ensure we don't auto-redirect if user visits /admin/login explicitly.
    // The user issue is: "I am logged in as CUSTOMER, go to homepage, click ADMIN, and I am ALREADY logged in as ADMIN".
    // This implies Firebase Auth is sharing session or we are auto-redirecting.
    // Since we use separate auth instances (one for customer 'auth', one for admin 'adminAuth'), they SHOULD be separate.
    // However, if the user logged in as Admin BEFORE, and session persisted, they are still logged in.
    // The user does NOT want this auto-login for Admin.

    // Solution: When visiting the Login Page, force logout of Admin.
    useEffect(() => {
        logout();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (isResetting) {
            if (!email) {
                setError('Por favor ingresa tu correo electrónico.');
                return;
            }
            const result = await resetPassword(email);
            if (result.success) {
                setSuccessMsg('Se ha enviado un enlace de recuperación a tu correo.');
                setIsResetting(false);
            } else {
                setError('Error al enviar el correo: ' + result.message);
            }
            return;
        }

        let result;
        if (isRegistering) {
            result = await register(email, password);
        } else {
            result = await login(email, password);
        }

        if (result.success) {
            if (isRegistering) {
                setSuccessMsg(result.message || 'Registro exitoso. Espera aprobación.');
                // Optional: Switch back to login mode so they see the message clearly
                // setIsRegistering(false); 
            } else {
                navigate('/admin');
            }
        } else {
            // Translate common Firebase errors
            let msg = result.message;
            if (msg.includes('auth/email-already-in-use')) {
                msg = 'Este correo ya está registrado. Por favor, inicia sesión.';
            } else if (msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) {
                msg = 'Contraseña o correo incorrectos.';
            } else if (msg.includes('auth/user-not-found')) {
                msg = 'No existe una cuenta con este correo.';
            } else if (msg.includes('auth/weak-password')) {
                msg = 'La contraseña debe tener al menos 6 caracteres.';
            } else if (msg.includes('auth/too-many-requests')) {
                msg = 'Demasiados intentos fallidos. Intenta más tarde.';
            }
            setError(msg);
        }
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setIsResetting(false);
        setError('');
        setSuccessMsg('');
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <div className="admin-login-icon">
                        <Lock size={32} />
                    </div>
                    <h1>
                        {isResetting ? 'Recuperar Contraseña' :
                            isRegistering ? 'Registrar Admin' : 'Acceso Administrativo'}
                    </h1>
                    <p>Sistema de Gestión Farmony</p>
                </div>

                {error && <div className="admin-error-message">{error}</div>}
                {successMsg && <div className="admin-success-message" style={{ color: 'green', background: '#dcfce7', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>{successMsg}</div>}

                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="input-group">
                        <label>Email</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ej. admin@farmony.com"
                                required
                            />
                        </div>
                    </div>

                    {!isResetting && (
                        <div className="input-group">
                            <label>Contraseña</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required={!isResetting}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#64748b',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    {showPassword ? 'Ocultar' : 'Ver'}
                                </button>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn-admin-login">
                        {isResetting ? 'Enviar Enlace' :
                            isRegistering ? 'Registrar' : 'Ingresar al Sistema'}
                        {!isResetting && <ArrowRight size={18} />}
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                        {!isResetting && !isRegistering && (
                            <button
                                type="button"
                                onClick={() => { setIsResetting(true); setError(''); }}
                                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={toggleMode}
                            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {isResetting ? 'Volver al inicio de sesión' :
                                isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                        </button>
                    </div>
                </form>

                <div className="admin-login-footer">
                    <p>Acceso restringido únicamente a personal autorizado.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
