import { ShoppingCart, LogIn, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
    const { user, cartCount } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo-container" style={{ textDecoration: 'none' }}>
                    <div className="logo-text">
                        <span className="logo-main">N&Y</span>
                        <span className="logo-sub">MEDICAL EQUIPMENT</span>
                    </div>
                </Link>
                
                <nav className="nav-links">
                    <Link to="/shop" className="nav-link">Shop</Link>
                    <a href="#kits" className="nav-link">Student Kits</a>
                    <Link to="/about" className="nav-link">About</Link>
                    {user?.role === 'admin' && <Link to="/admin" className="nav-link admin-link">Admin</Link>}
                </nav>

                <div className="header-actions">
                    <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Dark Mode">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    <Link to={user ? "/profile" : "/signin"} className="auth-link">
                         {user ? (
                            <span className="welcome-text">Welcome, {user.firstName || user.first_name || user.username || user.name || 'User'}</span>
                         ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <LogIn size={20} />
                                <span>Sign In</span>
                            </div>
                         )}
                    </Link>

                    <Link to="/cart">
                        <button className="cart-btn">
                            <ShoppingCart size={24} color="#D4AF37" />
                            <span className="cart-badge">{cartCount}</span>
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
