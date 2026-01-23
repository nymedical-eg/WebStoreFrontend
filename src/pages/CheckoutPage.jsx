import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import './CheckoutPage.css';
import usePageTitle from '../hooks/usePageTitle';
import ReactGA from 'react-ga4';

const CheckoutPage = () => {
    usePageTitle('Checkout');
    const { user, guestCart, clearGuestCart, fetchCartCount } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    const [itemCount, setItemCount] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        governorate: '',
        city: '',
        address: ''
    });

    useEffect(() => {
        if (user) {
            navigate('/cart');
            return;
        }
        
        // Fetch cart details to show total
        const fetchGuestCart = async () => {
            const items = JSON.parse(localStorage.getItem('guestCart') || '[]');
            if (items.length === 0) {
                navigate('/cart');
                return;
            }
            
            try {
                // First get basic view to ensure we have item details
                const response = await fetch('https://nymedbackend.vercel.app/api/guest/view-cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items, couponCode: localStorage.getItem('guestCoupon') })
                });
                
                const data = await response.json();

                if (response.ok) {
                    setCartItems(data.cart || []);
                    
                    // Now try to calculate exact totals including coupons
                    try {
                        const calcResponse = await fetch('https://nymedbackend.vercel.app/api/guest/calculate-cart', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                items, 
                                couponCode: localStorage.getItem('guestCoupon') 
                            })
                        });

                        if (calcResponse.ok) {
                            const calcData = await calcResponse.json();
                            setCartTotal(calcData.total || 0);
                            setAppliedCoupon(calcData.coupon || null);
                        } else {
                            setCartTotal(data.total || 0);
                        }
                    } catch (e) {
                         setCartTotal(data.total || 0);
                    }

                    setItemCount(data.cart ? data.cart.length : 0);
                }
            } catch (err) {
                console.error("Failed to load cart for checkout", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGuestCart();
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        // Basic validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || 
            !formData.governorate || !formData.city || !formData.address) {
            setError('Please fill in all fields.');
            setSubmitting(false);
            return;
        }

        const items = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const couponCode = localStorage.getItem('guestCoupon');

        const payload = {
            guestInfo: formData,
            items,
            couponCode
        };

        try {
            const response = await fetch('https://nymedbackend.vercel.app/api/guest/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                
                ReactGA.event("purchase", {
                    transaction_id: data.orderId || data._id || Date.now().toString(),
                    currency: "EGP",
                    value: cartTotal,
                    items: items 
                });

                setSuccess(true);
                clearGuestCart();
                localStorage.removeItem('guestCoupon');
            } else {
                const data = await response.json();
                setError(data.message || 'Order failed. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loader-container">
                <Loader2 size={40} className="animate-spin" color="#D4AF37" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="checkout-page success-view">
                <div className="success-card">
                    <h2>Order Placed Successfully!</h2>
                    <p>Thank you for your purchase, {formData.firstName}.</p>
                    <p>We have sent a confirmation email to {formData.email}.</p>
                    <button onClick={() => navigate('/shop')} className="cta-btn small">Continue Shopping</button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <button className="back-link" onClick={() => navigate('/cart')}>
                <ArrowLeft size={16} /> Back to Cart
            </button>
            <h1 className="page-title">Checkout</h1>

            <div className="checkout-container">
                <div className="checkout-form-section">
                    <h2>Shipping Information</h2>
                    {error && <div className="error-message">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="checkout-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Governorate</label>
                                <input type="text" name="governorate" value={formData.governorate} onChange={handleChange} required placeholder="e.g. Cairo" />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="e.g. Nasr City" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Address</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} required placeholder="Street, Building, Apt..." rows="3"></textarea>
                        </div>

                        <button type="submit" className="submit-order-btn" disabled={submitting}>
                            {submitting ? <Loader2 className="animate-spin" /> : `Place Order (${cartTotal.toFixed(2)} EGP)`}
                        </button>
                    </form>
                </div>

                <div className="checkout-summary-section">
                    <div className="summary-card">
                        <h3>Order Summary</h3>
                        
                        <div className="summary-items-list" style={{marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem'}}>
                            {cartItems.map((item, idx) => {
                                const displayItem = item.product || item.package;
                                if (!displayItem) return null;
                                return (
                                    <div key={idx} className="summary-item-compact" style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem', color: '#555'}}>
                                        <span>{item.quantity} x {displayItem.name}</span>
                                        <span>{(displayItem.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {appliedCoupon && (
                            <div className="summary-row" style={{ color: '#2ecc71', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                <span>Coupon: {appliedCoupon.code || appliedCoupon}</span>
                                <span>Applied</span>
                            </div>
                        )}

                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{cartTotal.toFixed(2)} EGP</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
