import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/signin');
        }
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>My Profile</h1>
            <div style={{ 
                background: 'var(--color-bg)', 
                padding: '2rem', 
                borderRadius: '12px',
                border: '1px solid #eee',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Full Name</label>
                    <div style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--color-text)' }}>
                        {user.firstName || user.first_name || user.name || 'N/A'} {user.lastName || user.last_name || ''}
                    </div>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Email Address</label>
                    <div style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--color-text)' }}>
                        {user.email || 'N/A'}
                    </div>
                </div>

                {(user.phone || user.phoneNumber) && (
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Phone Number</label>
                        <div style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--color-text)' }}>
                            {user.phone || user.phoneNumber}
                        </div>
                    </div>
                )}

                <button 
                    onClick={() => { logout(); navigate('/'); }}
                    style={{
                        padding: '0.8rem 1.5rem',
                        background: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
