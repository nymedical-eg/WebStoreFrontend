import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Trash2, Plus, Minus, Tag, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import usePageTitle from '../hooks/usePageTitle';

const CartPage = () => {
    usePageTitle('Your Cart');
    const { user, fetchCartCount } = useAuth();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null); // ID of item being updated
    const [isClearing, setIsClearing] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const [cartMessage, setCartMessage] = useState('');
    
    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/signin');
            return;
        }
        fetchCart();
    }, [user, navigate]);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://nymedbackend.vercel.app/api/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (response.ok) {
                setCartItems(data.cart || []);
                setTotal(data.total || 0);
                // Assume backend returns these fields, or fallback to simple total
                setSubtotal(data.subtotal || data.total || 0); 
                setDiscount(data.discount || 0);
                setAppliedCoupon(data.coupon || null);
            }
        } catch (error) {
            console.error("Error fetching cart", error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, currentQty, delta) => {
        const newQty = delta === 1 ? 1 : -1; 
        
        setProcessingId(productId);
        setCartMessage(''); 
        
        const url = `https://nymedbackend.vercel.app/api/cart/${productId}`;
        const body = { quantity: newQty };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            
            const data = await response.json();
            if (data.message) {
                // Short lived success message
                setCartMessage(data.message);
                setTimeout(() => setCartMessage(''), 3000);
            }

            if (response.ok) {
               await fetchCart(); 
            } else {
                console.error("Failed to update quantity");
            }
        } catch (error) {
            console.error("Error updating quantity", error);
        } finally {
            setProcessingId(null);
        }
    };

    const removeItem = async (productId) => {
        setProcessingId(productId); 
        setCartMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://nymedbackend.vercel.app/api/cart/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchCart(); 
                fetchCartCount(token); 
            } else {
                console.error("Failed to remove item");
            }
        } catch (error) {
            console.error("Error removing item", error);
        } finally {
            setProcessingId(null);
        }
    };

    const clearCart = async () => {
        setIsClearing(true);
        setCartMessage('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://nymedbackend.vercel.app/api/cart', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchCart();
                fetchCartCount(token);
            }
        } catch (error) {
            console.error("Error clearing cart", error);
        } finally {
            setIsClearing(false);
        }
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        
        setIsApplyingCoupon(true);
        setCartMessage('');
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://nymedbackend.vercel.app/api/cart/apply-coupon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: couponCode })
            });

            const data = await response.json();

            if (response.ok) {
                setCartMessage('Coupon applied successfully!');
                await fetchCart(); // Refresh cart to get new totals
                setCouponCode('');
            } else {
                setCheckoutError(data.message || 'Failed to apply coupon');
                setTimeout(() => setCheckoutError(''), 3000);
            }
        } catch (error) {
            setCheckoutError('Error applying coupon');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const removeCoupon = async () => {
        setIsApplyingCoupon(true);
        setCartMessage('');
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://nymedbackend.vercel.app/api/cart/remove-coupon', {
                method: 'POST', // Using POST as per request
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setCartMessage('Coupon removed.');
                await fetchCart(); // Refresh cart
            } else {
                const data = await response.json();
                setCheckoutError(data.message || 'Failed to remove coupon');
            }
        } catch (error) {
            setCheckoutError('Error removing coupon');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        setCheckoutError('');
        setCartMessage('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://nymedbackend.vercel.app/api/orders', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                await fetchCart();
                fetchCartCount(token);
                setCartMessage('Order placed successfully!');
            } else {
                const data = await response.json();
                setCheckoutError(data.message || 'Checkout failed');
            }
        } catch (error) {
            setCheckoutError(error.message || 'Checkout failed');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (loading) {
        return (
            <div className="loader-container">
                <Loader2 size={40} className="animate-spin" color="#D4AF37" />
                <p>Loading Cart...</p>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-empty">
                <h2>Cart Empty</h2>
                <p>Add Products to fill</p>
                <button onClick={() => navigate('/shop')} className="cta-btn small">Go to Shop</button>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-header">
                <h1>Your Cart</h1>
                <button 
                    className="clear-cart-btn" 
                    onClick={clearCart}
                    disabled={isClearing}
                >
                    {isClearing ? 'Clearing...' : 'Clear Cart'}
                </button>
            </div>
            
            {cartMessage && <div className="cart-message" style={{textAlign: 'center', color: '#D4AF37', margin: '1rem 0'}}>{cartMessage}</div>}

            <div className="cart-items">
                {cartItems.map(item => {
                    const product = item.product || {};
                    const idToUse = product._id || item._id;
                    
                    return (
                        <div key={idToUse} className="cart-item">
                            <img src={product.image} alt={product.name} className="cart-item-img" />
                            
                            <div className="cart-item-details">
                                <h3>{product.name}</h3>
                                <p className="cart-item-price">{product.price} EGP</p>
                                <p className="cart-item-stock">Stock: {product.stock}</p>
                            </div>

                            <div className="cart-item-actions">
                                <div className="quantity-control small">
                                    <button 
                                        className="qty-btn" 
                                        onClick={() => updateQuantity(idToUse, item.quantity, -1)}
                                        disabled={item.quantity <= 1 || processingId === idToUse}
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="qty-display">{item.quantity}</span>
                                    <button 
                                        className="qty-btn" 
                                        onClick={() => updateQuantity(idToUse, item.quantity, 1)}
                                        disabled={item.quantity >= product.stock || processingId === idToUse}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                
                                <button 
                                    className="remove-btn"
                                    onClick={() => removeItem(idToUse)}
                                    disabled={processingId === idToUse}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="cart-footer">
                
                {/* Coupon Section */}
                <div className="coupon-section">
                    {appliedCoupon ? (
                        <div className="applied-coupon">
                            <div className="coupon-code">
                                <Tag size={16} />
                                {appliedCoupon.code || appliedCoupon} Applied
                            </div>
                            <button 
                                className="remove-coupon-btn" 
                                onClick={removeCoupon}
                                disabled={isApplyingCoupon}
                                title="Remove Coupon"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="coupon-input-group">
                            <input 
                                type="text" 
                                placeholder="Coupon Code" 
                                className="coupon-input"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                            />
                            <button 
                                className="apply-coupon-btn" 
                                onClick={applyCoupon}
                                disabled={isApplyingCoupon || !couponCode.trim()}
                            >
                                {isApplyingCoupon ? <Loader2 size={16} className="animate-spin"/> : 'Apply'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Cart Summary */}
                <div className="cart-summary">
                    <div className="cart-summary-row">
                        <span className="cart-summary-label">Subtotal:</span>
                        <span className="cart-summary-value">{subtotal.toFixed(2)} EGP</span>
                    </div>
                    {discount > 0 && (
                        <div className="cart-summary-row">
                            <span className="cart-summary-label">Discount:</span>
                            <span className="cart-summary-value discount-value">- {discount.toFixed(2)} EGP</span>
                        </div>
                    )}
                    <div className="cart-summary-row total">
                        <span className="cart-summary-label">Total:</span>
                        <span className="cart-summary-value total-amount">{total.toFixed(2)} EGP</span>
                    </div>
                </div>
                
                {checkoutError && <p className="error-text" style={{marginTop: '1rem', color: '#ef4444'}}>{checkoutError}</p>}
                
                <div style={{ marginTop: '1.5rem' }}>
                    <button 
                        className="checkout-btn"
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                    >
                        {isCheckingOut ? <Loader2 className="animate-spin" /> : "Buy Now!"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
