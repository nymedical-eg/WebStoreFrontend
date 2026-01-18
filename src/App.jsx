import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Header and Footer moved to layouts
import LandingPage from './pages/LandingPage';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ShippingPage from './pages/ShippingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SignInPage from './pages/SignInPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import AdminPage from './pages/AdminPage';

import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminAdminsPage from './pages/AdminAdminsPage';
import AdminCouponsPage from './pages/AdminCouponsPage';
import './App.css';

import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main Public Layout */}
          <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/shipping" element={<ShippingPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/cart" element={<CartPage />} />
          </Route>

          {/* Admin Layout */}
          <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="admins" element={<AdminAdminsPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              {/* Future admin routes */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
