// Main App Component with Providers
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AccountPage from './pages/AccountPage';
import GenericPage from './pages/GenericPage';
import CategoryPage from './components/CategoryPage';

import Footer from './components/Footer';
import InfoSection from './components/InfoSection';
import SpecialOffers from './components/SpecialOffers';
import TrendingProducts from './components/TrendingProducts';
import HealthTips from './components/HealthTips';
import PersonalCare from './components/PersonalCare';
import CheckoutPage from './pages/CheckoutPage'; // Import CheckoutPage
import LoginPage from './pages/LoginPage'; // Import LoginPage
import ChatBot from './components/ChatBot'; // Import ChatBot
import HeroSection from './components/HeroSection'; // Import HeroSection
import SearchPage from './pages/SearchPage'; // Import SearchPage
import OrderConfirmationPage from './pages/OrderConfirmationPage'; // Import OrderConfirmationPage
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage'; // Import CartPage
import HomePage from './pages/HomePage';


import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import './App.css';

// Admin Imports
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminSales from './pages/admin/AdminSales';
import AdminTeam from './pages/admin/AdminTeam';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPageBuilder from './pages/admin/AdminPageBuilder';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1>¡Ups! Algo salió mal.</h1>
          <p>La aplicación ha encontrado un error inesperado.</p>
          <p style={{ color: 'red', fontSize: '0.9rem' }}>{this.state.error && this.state.error.toString()}</p>
          <button
            onClick={this.handleReset}
            style={{
              marginTop: '1rem',
              padding: '10px 20px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Reiniciar Aplicación (Borrar Datos Locales)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <AdminAuthProvider>
              <AuthProvider>
                <WishlistProvider>
                  <CartProvider>
                    <div className="app">
                      <Routes>
                        {/* --- ADMIN ROUTES --- */}
                        <Route path="/admin/login" element={<AdminLogin />} />

                        <Route path="/admin" element={
                          <ProtectedAdminRoute>
                            <AdminLayout />
                          </ProtectedAdminRoute>
                        }>
                          <Route index element={<AdminDashboard />} />
                          <Route path="products" element={
                            <ProtectedAdminRoute requiredModule="products">
                              <AdminProducts />
                            </ProtectedAdminRoute>
                          } />
                          <Route path="products/new" element={
                            <ProtectedAdminRoute requiredModule="products">
                              <ProductForm />
                            </ProtectedAdminRoute>
                          } />
                          <Route path="products/edit/:id" element={
                            <ProtectedAdminRoute requiredModule="products">
                              <ProductForm />
                            </ProtectedAdminRoute>
                          } />
                          <Route path="customers" element={
                            <ProtectedAdminRoute requiredModule="customers">
                              <AdminCustomers />
                            </ProtectedAdminRoute>
                          } />
                          <Route path="sales" element={
                            <ProtectedAdminRoute requiredModule="sales">
                              <AdminSales />
                            </ProtectedAdminRoute>
                          } />
                          <Route path="team" element={
                            <ProtectedAdminRoute>
                              <AdminTeam />
                            </ProtectedAdminRoute>
                          } />
                          <Route path="settings" element={
                            <ProtectedAdminRoute>
                              <AdminSettings />
                            </ProtectedAdminRoute>
                          } />
                          <Route path="builder" element={
                            <ProtectedAdminRoute>
                              <AdminPageBuilder />
                            </ProtectedAdminRoute>
                          } />
                        </Route>

                        {/* --- PUBLIC ROUTES --- */}
                        <Route path="/*" element={
                          <>
                            <Header />
                            <main className="main-content">
                              <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/category/:categoryName" element={<CategoryPage />} />
                                <Route path="/product/:id" element={<ProductDetailPage />} />
                                <Route path="/search" element={<SearchPage />} />
                                <Route path="/account" element={<AccountPage />} />
                                <Route path="/login" element={<LoginPage />} />

                                {/* Footer Routes */}
                                <Route path="/contact" element={<ContactPage />} />
                                <Route path="/faq" element={<GenericPage title="Preguntas Frecuentes" content="Aquí encontrarás respuestas a las dudas más comunes sobre nuestros servicios y productos." />} />
                                <Route path="/billing" element={<GenericPage title="Facturación Electrónica" content="Genera tu factura electrónica ingresando los datos de tu ticket de compra." />} />
                                <Route path="/stores" element={<GenericPage title="Sucursales" content="Encuentra tu sucursal Farmony más cercana. Contamos con más de 50 ubicaciones." />} />

                                <Route path="/about" element={<AboutPage />} />
                                <Route path="/jobs" element={<GenericPage title="Bolsa de Trabajo" content="Únete a nuestro equipo. Revisa nuestras vacantes disponibles y envíanos tu CV." />} />
                                <Route path="/investors" element={<GenericPage title="Relación con Inversionistas" content="Información financiera y corporativa para nuestros inversionistas y accionistas." />} />
                                <Route path="/privacy" element={<PrivacyPage />} />

                                <Route path="/services/consultorio" element={<GenericPage title="Consultorio Médico" content="Consulta médica general y especializada a precios accesibles en nuestras sucursales." />} />
                                <Route path="/services/analisis" element={<GenericPage title="Análisis Clínicos" content="Laboratorio de análisis clínicos con la mejor tecnología y precisión." />} />
                                <Route path="/checkout" element={<CheckoutPage />} />
                                <Route path="/cart" element={<CartPage />} />
                                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                              </Routes>
                            </main>
                            <Footer />
                            <ChatBot />
                          </>
                        } />
                      </Routes>
                    </div>
                  </CartProvider>
                </WishlistProvider>
              </AuthProvider>
            </AdminAuthProvider>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
