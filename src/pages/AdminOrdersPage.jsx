import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Edit, Check, Loader2, ArrowLeft, Tag } from 'lucide-react';
import '../styles/AdminResponsive.css';

const AdminOrdersPage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter State
    const [filterText, setFilterText] = useState('');
    const [filterField, setFilterField] = useState('all');
    const [filterOperator, setFilterOperator] = useState('contains'); // 'contains', 'greater', 'less', 'equal', 'after', 'before'
    const [startDate, setStartDate] = useState('');
    const [couponFilterType, setCouponFilterType] = useState('any'); // 'any', 'none', 'specific'

    // Modal State
    const [editingOrder, setEditingOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const statusColors = {
        'Pending': '#f97316',   // Orange
        'Cancelled': '#ef4444', // Red
        'Shipped': '#eab308',   // Yellow
        'Completed': '#22c55e', // Green
        'Confirmed': '#06b6d4'  // Cyan
    };

    const statusOptions = ['Pending', 'Shipped', 'Confirmed', 'Cancelled', 'Completed'];

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [filterText, filterField, filterOperator, startDate, orders, couponFilterType]);

    // ... (fetchOrders and filterOrders) ...

    // FORCED LIGHT THEME FOR DROPDOWNS AS REQUESTED
    const inputStyle = {
        background: '#ffffff', // Force white
        color: '#000000',      // Force black
        border: '1px solid var(--border-color)',
        padding: '0.5rem',
        borderRadius: '4px',
        outline: 'none'
    };

    const selectStyle = {
        ...inputStyle,
        appearance: 'none', 
        cursor: 'pointer'
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('https://nymedbackend.vercel.app/api/orders/all', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-role': user.role
                }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = orders;

        if (filterField === 'createdAt') {
            if (!startDate) {
                setFilteredOrders(orders);
                return;
            }
            const filterDate = new Date(startDate).getTime();
            filtered = orders.filter(order => {
                const orderDate = new Date(order.createdAt).getTime();
                if (filterOperator === 'before') return orderDate < filterDate;
                if (filterOperator === 'after') return orderDate > filterDate;
                // Default equal (day match) - tricky with timestamps, lets just do simple date string match
                const d1 = new Date(order.createdAt).toDateString();
                const d2 = new Date(startDate).toDateString();
                return d1 === d2;
            });
        } 
        
        else if (filterField === 'totalAmount') {
             if (!filterText) {
                setFilteredOrders(orders);
                return;
            }
            const val = parseFloat(filterText);
            filtered = orders.filter(order => {
                const amount = order.totalAmount;
                if (filterOperator === 'greater') return amount > val;
                if (filterOperator === 'less') return amount < val;
                return amount === val;
            });
        } 
        
        else if (filterField === 'coupon') {
            filtered = orders.filter(order => {
                const hasCoupon = order.couponApplied && order.couponApplied.code;
                
                if (couponFilterType === 'any') return hasCoupon;
                if (couponFilterType === 'none') return !hasCoupon;
                
                if (couponFilterType === 'specific') {
                    if (!filterText) return hasCoupon; // If specific but no text, show all with coupons (or maybe none?) - let's show match
                    const code = order.couponApplied?.code?.toLowerCase() || '';
                    return code.includes(filterText.toLowerCase());
                }
                return true;
            });
        }

        else {
             if (!filterText) {
                setFilteredOrders(orders);
                return;
            }
            const lowerText = filterText.toLowerCase();
            filtered = orders.filter(order => {
                const idStr = order._id.toLowerCase();
                const statusStr = order.status.toLowerCase();
                const userStr = (order.user?.username || order.user?.email || 'Guest').toLowerCase();

                switch (filterField) {
                    case 'status': return statusStr.includes(lowerText);
                    case '_id': return idStr.includes(lowerText);
                    case 'user': return userStr.includes(lowerText);
                    default: 
                        // For 'all', just search text fields
                        const dateStr = new Date(order.createdAt).toLocaleDateString().toLowerCase();
                        const totalStr = order.totalAmount.toString();
                        const productMatch = order.products?.some(p => 
                            p.product?.name?.toLowerCase().includes(lowerText)
                        );

                        return statusStr.includes(lowerText) || 
                               totalStr.includes(lowerText) || 
                               idStr.includes(lowerText) || 
                               userStr.includes(lowerText) || 
                               dateStr.includes(lowerText) ||
                               productMatch;
                }
            });
        }

        setFilteredOrders(filtered);
    };

    const openEditModal = (order) => {
        setEditingOrder(order);
        setNewStatus(order.status);
        setIsStatusModalOpen(true);
    };

    const handleStatusUpdate = async () => {
        if (!editingOrder) return;

        try {
            const res = await fetch(`https://nymedbackend.vercel.app/api/orders/${editingOrder._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'x-role': user.role
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                fetchOrders(); 
                setIsStatusModalOpen(false);
                setEditingOrder(null);
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            console.error(err);
            alert('Error updating status');
        }
    };



    const renderFilterInputs = () => {
        if (filterField === 'createdAt') {
             return (
                 <>
                    <select 
                        value={filterOperator} 
                        onChange={(e) => setFilterOperator(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="equal">On Date</option>
                        <option value="before">Before</option>
                        <option value="after">After</option>
                    </select>
                    <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={inputStyle}
                    />
                 </>
             )
        }
        
        if (filterField === 'totalAmount') {
             return (
                 <>
                    <select 
                        value={filterOperator} 
                        onChange={(e) => setFilterOperator(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="equal">Equal To</option>
                        <option value="greater">Greater Than</option>
                        <option value="less">Less Than</option>
                    </select>
                    <input 
                        type="number"
                        placeholder="Amount"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        style={inputStyle}
                    />
                 </>
             )
        }

        if (filterField === 'coupon') {
             return (
                 <>
                    <select 
                        value={couponFilterType} 
                        onChange={(e) => setCouponFilterType(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="any">Has Coupon (Any)</option>
                        <option value="none">No Coupon</option>
                        <option value="specific">Specific Code</option>
                    </select>
                    
                    {couponFilterType === 'specific' && (
                        <input 
                            placeholder="Coupon Code..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            style={inputStyle}
                        />
                    )}
                 </>
             )
        }

        // Default text search
        return (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                <Search size={20} color="var(--text-light)" />
                <input 
                    placeholder="Search..." 
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        fontSize: '1rem', 
                        color: 'var(--text-primary)', 
                        width: '100%',
                        outline: 'none'
                    }}
                />
            </div>
        )
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={40} color="#D4AF37" /></div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
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
            <h1 style={{ marginBottom: '2rem' }}>Manage Orders</h1>

            {/* Filter Bar */}
            {/* Filter Bar */}
            <div 
                className="filter-bar-stack"
                style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginBottom: '2rem', 
                backgroundColor: 'var(--bg-secondary)', 
                padding: '1rem', 
                borderRadius: '8px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={20} color="var(--text-light)" />
                    <select 
                        value={filterField} 
                        onChange={(e) => {
                            setFilterField(e.target.value);
                            setFilterText('');
                            setStartDate('');
                            setFilterOperator('equal'); // Reset operator
                        }}
                        style={selectStyle}
                    >
                        <option value="all">All Fields</option>
                        <option value="status">Status</option>
                        <option value="_id">Order ID</option>
                        <option value="totalAmount">Total Amount</option>
                        <option value="coupon">Coupon Usage</option>
                        <option value="user">User</option>
                        <option value="createdAt">Date</option>
                    </select>
                </div>

                {renderFilterInputs()}
            </div>

            {/* Orders List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredOrders.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>No orders found.</p>
                ) : (
                    filteredOrders.map(order => (
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
                            <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Order #{order._id}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                                        {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                    <p style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>
                                        User: <span style={{ fontWeight: 'normal' }}>{order.user?.username || order.user?.email || 'Guest'}</span>
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#D4AF37' }}>
                                        {order.totalAmount} EGP
                                    </p>
                                    {order.couponApplied && (
                                        <div style={{ fontSize: '0.85rem', marginTop: '0.2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                            <span style={{ color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Tag size={12} /> {order.couponApplied.code}
                                            </span>
                                            <span style={{ color: '#ef4444' }}>
                                                -{order.couponApplied.discountAmount} EGP
                                            </span>
                                        </div>
                                    )}
                                    <span style={{ 
                                        display: 'inline-block', 
                                        padding: '0.25rem 0.75rem', 
                                        borderRadius: '999px', 
                                        fontSize: '0.85rem', 
                                        fontWeight: 'bold',
                                        backgroundColor: `${statusColors[order.status]}20`, // 20% opacity background
                                        color: statusColors[order.status],
                                        marginTop: '0.5rem'
                                    }}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '4px' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-light)' }}>Items:</h4>
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
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <button 
                                    onClick={() => openEditModal(order)}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem', 
                                        backgroundColor: '#D4AF37', 
                                        color: '#000', 
                                        border: 'none', 
                                        padding: '0.5rem 1rem', 
                                        borderRadius: '4px', 
                                        fontWeight: 'bold' 
                                    }}
                                >
                                    <Edit size={16} /> Edit Status
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Status Edit Modal */}
            {isStatusModalOpen && (
                <div 
                    onClick={() => setIsStatusModalOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="mobile-modal-content"
                        style={{
                            backgroundColor: 'var(--color-bg)',
                            padding: '2rem',
                            borderRadius: '8px',
                            width: '90%',
                            maxWidth: '400px',
                            border: '1px solid #D4AF37',
                            textAlign: 'center'
                        }}
                    >
                        <h2 style={{ marginBottom: '1.5rem', color: '#D4AF37' }}>Update Order Status</h2>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Change status for Order <strong>#{editingOrder?._id}</strong>
                        </p>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>New Status:</label>
                            <select 
                                value={newStatus} 
                                onChange={(e) => setNewStatus(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '0.8rem', 
                                    backgroundColor: '#ffffff', // Force White
                                    color: '#000000',           // Force Black
                                    border: '1px solid #D4AF37', 
                                    borderRadius: '4px' 
                                }}
                            >
                                {statusOptions.map(status => (
                                    <option 
                                        key={status} 
                                        value={status} 
                                        style={{ backgroundColor: '#ffffff', color: '#000000' }}
                                    >
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button 
                                onClick={() => setIsStatusModalOpen(false)}
                                style={{ 
                                    padding: '0.75rem 1.5rem', 
                                    backgroundColor: 'transparent', 
                                    border: '1px solid var(--border-color)', 
                                    color: 'var(--text-primary)', 
                                    borderRadius: '4px' 
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleStatusUpdate}
                                style={{ 
                                    padding: '0.75rem 1.5rem', 
                                    backgroundColor: '#D4AF37', 
                                    color: '#000', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Check size={16} /> Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersPage;
