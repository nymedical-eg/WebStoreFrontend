import { Outlet, Link } from 'react-router-dom';
import { Moon, Sun, Home } from 'lucide-react';
import { useState, useEffect } from 'react';

const AdminLayout = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="admin-app" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <header style={{ 
                padding: '1rem 2rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <Link to="/" style={{ 
                        textDecoration: 'none', 
                        color: '#D4AF37', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        fontWeight: 'bold',
                        border: '1px solid #D4AF37',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px'
                    }}>
                        <Home size={18} />
                        Return Home
                    </Link>
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Admin Dashboard</h2>
                </div>

                <button 
                    onClick={toggleTheme} 
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                    aria-label="Toggle Dark Mode"
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            </header>
            
            <main style={{ padding: '2rem' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
