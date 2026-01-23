import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ReactGA from 'react-ga4';

// Initialize GA4
ReactGA.initialize("G-N7SEJS65PW"); 

// Header and Footer moved to layouts
import LandingPage from './pages/LandingPage';
import ShopPage from './pages/ShopPage';
import PackagesPage from './pages/PackagesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ShippingPage from './pages/ShippingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SignInPage from './pages/SignInPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';

import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminAdminsPage from './pages/AdminAdminsPage';
import AdminCouponsPage from './pages/AdminCouponsPage';
import AdminPackagesPage from './pages/AdminPackagesPage';
import './App.css';

import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Component to track page views
const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteTracker />
        <Routes>
          {/* Main Public Layout */}
          <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/shipping" element={<ShippingPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
          </Route>

          {/* Admin Layout */}
          <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="admins" element={<AdminAdminsPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="packages" element={<AdminPackagesPage />} />
              {/* Future admin routes */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
