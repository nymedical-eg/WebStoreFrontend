import { ShoppingCart, LogIn, Moon, Sun, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';
import logo from '../images/NYmedAlphaLogo.png';

const Header = () => {
    const { user, cartCount } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo-container" style={{ textDecoration: 'none' }} onClick={closeMobileMenu}>
                    {/* 
                    <div className="logo-text">
                        <span className="logo-main">N&Y</span>
                        <span className="logo-sub">MEDICAL EQUIPMENT</span>
                    </div> 
                    */}
                    <img src={logo} alt="N&Y Medical" style={{ height: '50px', width: 'auto' }} />
                </Link>
                
                <nav className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/shop" className="nav-link">Shop</Link>
                    <a href="#kits" className="nav-link">Student Kits</a>
                    <Link to="/about" className="nav-link">About</Link>
                    {user?.role === 'admin' && <Link to="/admin" className="nav-link admin-link">Admin</Link>}
                </nav>

                <div className="header-actions">
                    <button className="theme-toggle-btn desktop-only" onClick={toggleTheme} aria-label="Toggle Dark Mode">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    <Link to={user ? "/profile" : "/signin"} className="auth-link" onClick={closeMobileMenu}>
                         {user ? (
                            <span className="welcome-text">Welcome, {user.firstName || user.first_name || user.username || user.name || 'User'}</span>
                         ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <LogIn size={20} />
                                <span>Sign In</span>
                            </div>
                         )}
                    </Link>

                    <Link to="/cart" onClick={closeMobileMenu}>
                        <button className="cart-btn">
                            <ShoppingCart size={24} color="#D4AF37" />
                            <span className="cart-badge">{cartCount}</span>
                        </button>
                    </Link>

                    <button className="burger-menu-btn" onClick={toggleMobileMenu} aria-label="Toggle Menu">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <nav className="mobile-nav-links">
                    <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>Home</Link>
                    <Link to="/shop" className="mobile-nav-link" onClick={closeMobileMenu}>Shop</Link>
                    <a href="#kits" className="mobile-nav-link" onClick={closeMobileMenu}>Student Kits</a>
                    <Link to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>About</Link>
                    {user?.role === 'admin' && <Link to="/admin" className="mobile-nav-link admin-link" onClick={closeMobileMenu}>Admin</Link>}
                    
                    <div className="mobile-theme-toggle">
                        <span>Dark Mode</span>
                        <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Dark Mode">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
