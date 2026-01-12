import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, Edit, X, Check, Package, Phone, User, Mail } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const ProfilePage = () => {
    usePageTitle('My Profile');
    const { user, login, logout } = useAuth(); // Assuming login helps update user state, or we might need to manually update local user state if AuthContext doesn't expose a 'updateUser' method. Re-fetching profile might be best.
    const navigate = useNavigate();
    
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        phone: ''
    });

    const statusColors = {
        'Pending': '#f97316',   // Orange
        'Cancelled': '#ef4444', // Red
        'Shipped': '#eab308',   // Yellow
        'Completed': '#22c55e', // Green
        'Confirmed': '#06b6d4'  // Cyan
    };

    useEffect(() => {
        if (!user) {
            navigate('/signin');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://nymedbackend.vercel.app/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Error fetching orders", err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const openEditModal = () => {
        setEditFormData({
            firstName: user.firstName || user.first_name || '',
            lastName: user.lastName || user.last_name || '',
            phone: user.phone || user.phoneNumber || ''
        });
        setIsEditModalOpen(true);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('https://nymedbackend.vercel.app/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editFormData)
            });

            const data = await res.json();

            if (res.ok) {
                // Fetch updated user data as requested
                const meRes = await fetch('https://nymedbackend.vercel.app/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (meRes.ok) {
                    const params = await meRes.json();
                    // Update Auth Context
                    login(params, token);
                }

                setIsEditModalOpen(false);
                window.location.reload(); 
            } else {
                alert(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            alert('Error updating profile');
        }
    };

    if (!user) return null;

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>My Profile</h1>
            
            {/* Profile Card */}
            <div style={{ 
                background: 'var(--color-bg)', 
                padding: '2rem', 
                borderRadius: '12px',
                border: '1px solid #eee',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                marginBottom: '3rem',
                position: 'relative'
            }}>
                <button 
                    onClick={openEditModal}
                    style={{ 
                        position: 'absolute', 
                        top: '1.5rem', 
                        right: '1.5rem',
                        background: 'transparent',
                        border: '1px solid #D4AF37',
                        color: '#D4AF37',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <Edit size={16} /> Edit
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-text-light)' }}>
                            <User size={16} /> <label style={{ fontSize: '0.9rem' }}>Full Name</label>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--color-text)' }}>
                            {user.firstName || user.first_name || user.name || 'N/A'} {user.lastName || user.last_name || ''}
                        </div>
                    </div>
                    
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-text-light)' }}>
                            <Mail size={16} /> <label style={{ fontSize: '0.9rem' }}>Email Address</label>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--color-text)' }}>
                            {user.email || 'N/A'}
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-text-light)' }}>
                            <Phone size={16} /> <label style={{ fontSize: '0.9rem' }}>Phone Number</label>
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--color-text)' }}>
                            {user.phone || user.phoneNumber || 'Not Set'}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
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

            {/* Order History */}
            {orders.length > 0 && (
                <div className="orders-section">
                    <h2 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package /> Previous Orders
                    </h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {orders.map(order => (
                             <div 
                                key={order._id} 
                                style={{ 
                                    backgroundColor: 'var(--bg-secondary)', 
                                    padding: '1.5rem', 
                                    borderRadius: '8px',
                                    borderLeft: `6px solid ${statusColors[order.status] || '#ccc'}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Order #{order._id}</h3>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#D4AF37' }}>
                                            {order.totalAmount} EGP
                                        </p>
                                        <span style={{ 
                                            display: 'inline-block', 
                                            padding: '0.25rem 0.75rem', 
                                            borderRadius: '999px', 
                                            fontSize: '0.85rem', 
                                            fontWeight: 'bold',
                                            backgroundColor: `${statusColors[order.status]}20`,
                                            color: statusColors[order.status],
                                            marginTop: '0.5rem'
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Items:</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {order.products && order.products.map((item, idx) => {
                                            const pName = item.product?.name || 'Unknown Product';
                                            const pPrice = item.product?.price || 0;
                                            return (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                    <span>{pName} <span style={{ color: '#D4AF37' }}>x{item.quantity}</span></span>
                                                    <span>{pPrice * item.quantity} EGP</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loadingOrders && orders.length === 0 && (
                 <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                     <Loader2 className="animate-spin" size={30} color="#D4AF37" />
                 </div>
            )}


             {/* Edit Profile Modal */}
             {isEditModalOpen && (
                <div 
                    onClick={() => setIsEditModalOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'var(--color-bg)',
                            padding: '2rem',
                            borderRadius: '8px',
                            width: '90%',
                            maxWidth: '400px',
                            border: '1px solid #D4AF37',
                            position: 'relative'
                        }}
                    >
                         <button 
                            onClick={() => setIsEditModalOpen(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '1.5rem', color: '#D4AF37' }}>Edit Profile</h2>
                        
                        <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>First Name</label>
                                <input 
                                    value={editFormData.firstName}
                                    onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.8rem', 
                                        backgroundColor: 'var(--bg-secondary)', 
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)', 
                                        borderRadius: '4px' 
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Last Name</label>
                                <input 
                                    value={editFormData.lastName}
                                    onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.8rem', 
                                        backgroundColor: 'var(--bg-secondary)', 
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)', 
                                        borderRadius: '4px' 
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Phone Number</label>
                                <input 
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.8rem', 
                                        backgroundColor: 'var(--bg-secondary)', 
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-color)', 
                                        borderRadius: '4px' 
                                    }}
                                />
                            </div>

                            <button 
                                type="submit"
                                style={{ 
                                    marginTop: '1rem',
                                    padding: '0.8rem', 
                                    backgroundColor: '#D4AF37', 
                                    color: '#000', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Check size={18} /> Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
