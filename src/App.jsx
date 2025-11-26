import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AccountPage from './pages/AccountPage';
// CategorySection removed from homepage as requested
import CategoryPage from './components/CategoryPage';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import InfoSection from './components/InfoSection';
import SpecialOffers from './components/SpecialOffers';
import TrendingProducts from './components/TrendingProducts';
import HealthTips from './components/HealthTips';
import PersonalCare from './components/PersonalCare';
import { CartProvider } from './context/CartContext';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={
                <>
                  <div className="hero">
                    <div className="hero-content">
                      <h1>Tu Salud es Nuestra Prioridad</h1>
                      <p>Descubre las mejores ofertas en medicamentos y productos de cuidado personal.</p>
                      <a href="#ofertas" className="hero-btn">Ver Ofertas</a>
                    </div>
                  </div>
                  <InfoSection />
                  <PersonalCare />
                  <SpecialOffers />
                  <TrendingProducts />
                  <HealthTips />
                </>
              } />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
                <Route path="/account" element={<AccountPage />} />
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
