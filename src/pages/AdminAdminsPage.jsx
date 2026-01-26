import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, Shield } from 'lucide-react';
import '../styles/AdminResponsive.css';

const AdminAdminsPage = () => {
    const { user } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const res = await fetch('https://nymedbackend.vercel.app/api/users/admins', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'x-role': user.role
                    }
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAdmins(data);
                } else {
                    console.error("API did not return an array", data);
                    setAdmins([]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdmins();
    }, [user.role]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={40} color="#D4AF37" /></div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <a 
                    href="/admin" 
                    style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        backgroundColor: '#D4AF37', 
                        color: '#000', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '4px', 
                        textDecoration: 'none', 
                        fontWeight: 'bold' 
                    }}
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </a>
            </div>
            
            <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Shield size={32} color="#D4AF37" /> Admin Users
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {admins.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No admins found.</p>
                ) : (
                    admins.map(admin => (
                        <div 
                            key={admin._id} 
                            className="mobile-card"
                            style={{ 
                                backgroundColor: 'var(--bg-secondary)', 
                                padding: '1.5rem', 
                                borderRadius: '8px',
                                borderLeft: '4px solid #D4AF37',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{admin.username}</h3>
                                <p style={{ color: 'var(--text-light)', margin: 0 }}>{admin.email}</p>
                            </div>
                            <div style={{ 
                                backgroundColor: 'rgba(212, 175, 55, 0.1)', 
                                color: '#D4AF37', 
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '999px',
                                fontSize: '0.85rem',
                                fontWeight: 'bold'
                            }}>
                                Admin
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminAdminsPage;
