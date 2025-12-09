import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, AlertCircle, Facebook, Globe, Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, register, loginWithGoogle, loginWithFacebook } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get redirect path from query params or default to home
    const from = new URLSearchParams(location.search).get('redirect') || '/';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSocialLogin = async (provider) => {
        setError('');
        setLoading(true);
        try {
            if (provider === 'google') {
                await loginWithGoogle();
            } else if (provider === 'facebook') {
                await loginWithFacebook();
            }
            navigate(from);
        } catch (err) {
            console.error(err);
            setError("Error al iniciar sesión con redes sociales. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await register(formData.email, formData.password, formData.fullName);
            }
            // Redirect after success
            navigate(from);
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>{isLogin ? 'Bienvenido de nuevo' : 'Crear Cuenta'}</h2>
                    <p>{isLogin ? 'Ingresa a tu cuenta para continuar' : 'Regístrate para gestionar tus pedidos'}</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="social-login-buttons">
                    <button
                        onClick={() => handleSocialLogin('google')}
                        className="social-btn google-btn"
                        disabled={loading}
                    >
                        <GoogleIcon />
                        <span>Continuar con Google</span>
                    </button>
                    <button
                        onClick={() => handleSocialLogin('facebook')}
                        className="social-btn facebook-btn"
                        disabled={loading}
                    >
                        <Facebook size={20} />
                        <span>Continuar con Facebook</span>
                    </button>
                </div>

                <div className="divider">
                    <span>O con correo electrónico</span>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label>Nombre Completo</label>
                            <div className="input-wrapper">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Ej. Juan Pérez"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                placeholder="tu@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Procesando...' : (
                            <>
                                {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                        <button onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
                            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
