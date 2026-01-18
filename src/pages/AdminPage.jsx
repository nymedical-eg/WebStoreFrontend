import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Users, ShoppingBag, Ticket, Box } from 'lucide-react';

const AdminPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user || user.role !== 'admin') {
        return null;
    }

    const cards = [
        { title: 'Orders', icon: <ShoppingBag size={48} />, path: '/admin/orders', color: '#3b82f6' },
        { title: 'Products', icon: <Package size={48} />, path: '/admin/products', color: '#D4AF37' },
        { title: 'Admins', icon: <Users size={48} />, path: '/admin/admins', color: '#10b981' },
        { title: 'Coupons', icon: <Ticket size={48} />, path: '/admin/coupons', color: '#f43f5e' },
        { title: 'Packages', icon: <Box size={48} />, path: '/admin/packages', color: '#8b5cf6' }
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Admin Dashboard</h1>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '2rem',
                justifyContent: 'center'
            }}>
                {cards.map((card) => (
                    <div 
                        key={card.title}
                        onClick={() => navigate(card.path)}
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            padding: '3rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '1rem',
                            border: '1px solid var(--border-color)',
                            transition: 'transfrom 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        <div style={{ color: card.color }}>{card.icon}</div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{card.title}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPage;
